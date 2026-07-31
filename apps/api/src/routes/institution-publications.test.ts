import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { resolve } from "node:path";
import test from "node:test";
import express from "express";
import { setSupabaseAdminForTests } from "../lib/supabase";
import { institutionPublicationsRouter } from "./institution-publications";

process.env.NODE_ENV = "test";

type Row = Record<string, any>;
class Fake {
  tables: Record<string,Row[]> = {
    profiles:[{id:"owner",username:"Owner",display_name:"Owner Label",tier:"institutional",is_admin:false},{id:"member",username:"Member",display_name:"Member Label",tier:"private",is_admin:false},{id:"invited",username:"Invited",display_name:"Invited Label",tier:"private",is_admin:false},{id:"removed",username:"Removed",display_name:"Removed Label",tier:"private",is_admin:false},{id:"other",username:"Other",display_name:"Other Label",tier:"private",is_admin:false}],
    institutions:[{id:"institution",owner_user_id:"owner",name:"Station Institutional Alpha",slug:"station-institutional-alpha",summary:null,verification_status:"verified",public_status:"public",verified_at:"now",verified_by_user_id:null,verification_revoked_at:null,verification_revoked_by_user_id:null,published_at:"now",unpublished_at:null,created_at:"now",updated_at:"now"}],
    institution_members:[{id:"membership",institution_id:"institution",user_id:"member",role:"member",status:"active"},{id:"invited-membership",institution_id:"institution",user_id:"invited",role:"member",status:"invited"},{id:"removed-membership",institution_id:"institution",user_id:"removed",role:"member",status:"removed"}],
    projects:[{id:"project",owner_user_id:null,institution_id:"institution",name:"Institution Project",slug:"institution-project",description:null,visibility:"public",connection_tier:"tier_1_showcase",created_at:"now",updated_at:"now"}],
    institution_publications:[], institution_audit_events:[],
  };
  users=new Map([["owner-token",{id:"owner",email:"owner@test"}],["member-token",{id:"member",email:"member@test"}],["invited-token",{id:"invited",email:"invited@test"}],["removed-token",{id:"removed",email:"removed@test"}],["other-token",{id:"other",email:"other@test"}]]);
  client={auth:{getUser:async(token:string)=>this.users.has(token)?{data:{user:this.users.get(token)},error:null}:{data:{user:null},error:{message:"bad"}}},from:(table:string)=>new Query(this,table),rpc:(name:string,args:Row)=>this.rpc(name,args)};
  row(table:string,id:string){return this.tables[table].find(row=>row.id===id)}
  async rpc(name:string,args:Row){
    const institution=this.row("institutions",args.p_institution_id)??this.row("institutions",this.row("institution_publications",args.p_publication_id)?.institution_id);
    const allowed=institution&&(institution.owner_user_id===args.p_actor_user_id||this.tables.institution_members.some(m=>m.institution_id===institution.id&&m.user_id===args.p_actor_user_id&&m.status==="active"));
    if(name==="create_institution_publication_v1"){
      if(!allowed||!this.tables.projects.some(p=>p.id===args.p_project_id&&p.institution_id===institution.id))return {data:null,error:null};
      const row={id:"publication",institution_id:institution.id,project_id:args.p_project_id,creator_user_id:args.p_actor_user_id,creator_label:args.p_actor_label,last_editor_user_id:args.p_actor_user_id,last_editor_label:args.p_actor_label,slug:args.p_slug,title:args.p_title,summary:args.p_summary,body:args.p_body,document_type:args.p_document_type,status:"draft",version:1,published_at:null,published_by_user_id:null,retracted_at:null,retracted_by_user_id:null,created_at:"2026-07-31T12:00:00Z",updated_at:"2026-07-31T12:00:00Z"};this.tables.institution_publications.push(row);return {data:structuredClone(row),error:null};
    }
    const publication=this.row("institution_publications",args.p_publication_id); if(!publication)return {data:[{outcome:"unavailable",publication_id:null,new_version:null}],error:null};
    if(name==="edit_institution_publication_v1"){
      if(!allowed||publication.status!=="draft")return {data:[{outcome:"unavailable",publication_id:null,new_version:null}],error:null};
      if(publication.version!==args.p_expected_version)return {data:[{outcome:"conflict",publication_id:publication.id,new_version:publication.version}],error:null};
      Object.assign(publication,{title:args.p_title,summary:args.p_summary,body:args.p_body,document_type:args.p_document_type,last_editor_user_id:args.p_actor_user_id,last_editor_label:args.p_actor_label,version:publication.version+1,updated_at:"2026-07-31T13:00:00Z"});return {data:[{outcome:"edited",publication_id:publication.id,new_version:publication.version}],error:null};
    }
    if(institution.owner_user_id!==args.p_actor_user_id||publication.version!==args.p_expected_version)return {data:[{outcome:publication.version!==args.p_expected_version?"conflict":"unavailable",publication_id:null,new_version:publication.version}],error:null};
    if(args.p_action==="publish"&&publication.status==="draft"&&institution.verification_status==="verified"&&institution.public_status==="public"){Object.assign(publication,{status:"published",published_at:"2026-07-31T14:00:00Z",version:publication.version+1});return {data:[{outcome:"published",publication_id:publication.id,new_version:publication.version}],error:null};}
    if(args.p_action==="retract"&&publication.status==="published"){Object.assign(publication,{status:"draft",published_at:null,version:publication.version+1});return {data:[{outcome:"retracted",publication_id:publication.id,new_version:publication.version}],error:null};}
    return {data:[{outcome:"unavailable",publication_id:null,new_version:null}],error:null};
  }
}
class Query {
  filters:Array<[string,any]>=[]; ins:Array<[string,any[]]>=[]; orderField:string|null=null;
  constructor(private db:Fake,private table:string){} select(_columns?:string){return this} eq(k:string,v:any){this.filters.push([k,v]);return this} in(k:string,v:any[]){this.ins.push([k,v]);return this} order(k:string,_options?:unknown){this.orderField=k;return this} maybeSingle(){return this.run(true)} single(){return this.run(true)} then(ok:any,bad:any){return this.run(false).then(ok,bad)}
  async run(single:boolean){let rows=[...(this.db.tables[this.table]??[])].filter(r=>this.filters.every(([k,v])=>r[k]===v)&&this.ins.every(([k,v])=>v.includes(r[k])));if(this.orderField)rows.sort((a,b)=>String(b[this.orderField!]).localeCompare(String(a[this.orderField!])));const data=structuredClone(rows);return {data:single?data[0]??null:data,error:null};}
}
function app(){const value=express();value.use(express.json());value.use(institutionPublicationsRouter);return value}
async function request(value:any,method:string,path:string,token?:string,body?:any){const server=await new Promise<Server>(r=>{const s=value.listen(0,"127.0.0.1",()=>r(s))});try{const port=(server.address() as AddressInfo).port;const response=await fetch(`http://127.0.0.1:${port}${path}`,{method,headers:{...(token?{Authorization:`Bearer ${token}`}:{}) ,...(body?{"Content-Type":"application/json"}:{})},body:body?JSON.stringify(body):undefined});return {status:response.status,body:await response.json()}}finally{await new Promise<void>(r=>server.close(()=>r()))}}
const draft={title:"Institution Field Note",summary:"Bounded summary.",body:"Collaborative publication body.",documentType:"article"};

test("member draft, optimistic edit, owner publication, retraction, and public boundary stay exact",async()=>{const db=new Fake();setSupabaseAdminForTests(db.client as any);const value=app();try{
  assert.equal((await request(value,"GET","/institutions/station-institutional-alpha/publications")).status,401);
  assert.equal((await request(value,"POST","/institutions/station-institutional-alpha/publications","other-token",{...draft,slug:"field-note",projectSlug:"institution-project"})).status,404);
  assert.equal((await request(value,"POST","/institutions/station-institutional-alpha/publications","invited-token",{...draft,slug:"field-note",projectSlug:"institution-project"})).status,404);
  assert.equal((await request(value,"POST","/institutions/station-institutional-alpha/publications","removed-token",{...draft,slug:"field-note",projectSlug:"institution-project"})).status,404);
  const created=await request(value,"POST","/institutions/station-institutional-alpha/publications","member-token",{...draft,slug:"field-note",projectSlug:"institution-project"});assert.equal(created.status,201);assert.deepEqual(Object.keys(created.body.publication).sort(),["access","body","createdAt","creatorLabel","documentType","institution","lastEditorLabel","project","publicHref","publishedAt","slug","status","summary","title","updatedAt","version","visibility"].sort());assert.equal(created.body.publication.creatorLabel,"Member Label");assert.equal(created.body.publication.access.canPublish,false);assert.equal(created.body.publication.access.readOnly,false);
  const edit=await request(value,"PATCH","/institutions/station-institutional-alpha/publications/field-note","owner-token",{...draft,title:"Owner edit",expectedVersion:1});assert.equal(edit.body.version,2);
  const stale=await request(value,"PATCH","/institutions/station-institutional-alpha/publications/field-note","member-token",{...draft,title:"Stale",expectedVersion:1});assert.equal(stale.status,409);assert.equal(db.row("institution_publications","publication").title,"Owner edit");
  assert.equal((await request(value,"POST","/institutions/station-institutional-alpha/publications/field-note/publish","member-token",{expectedVersion:2})).status,404);
  assert.equal((await request(value,"POST","/institutions/station-institutional-alpha/publications/field-note/publish","owner-token",{expectedVersion:2})).body.version,3);
  const publicRead=await request(value,"GET","/institutions/station-institutional-alpha/publications/public/field-note");assert.equal(publicRead.status,200);assert.deepEqual(Object.keys(publicRead.body.publication).sort(),["body","creatorLabel","documentType","institution","lastEditorLabel","project","publishedAt","slug","summary","title"].sort());assert.equal(JSON.stringify(publicRead.body).includes("publication"),true);assert.equal(JSON.stringify(publicRead.body).includes("member@test"),false);
  db.tables.institutions[0].public_status="private";assert.equal((await request(value,"GET","/institutions/station-institutional-alpha/publications/public/field-note")).status,404);db.tables.institutions[0].public_status="public";
  assert.equal((await request(value,"POST","/institutions/station-institutional-alpha/publications/field-note/retract","owner-token",{expectedVersion:3})).body.version,4);assert.equal((await request(value,"GET","/institutions/station-institutional-alpha/publications/public/field-note")).status,404);assert.equal((await request(value,"GET","/institutions/station-institutional-alpha/publications/field-note","member-token")).status,200);
}finally{setSupabaseAdminForTests(null)}});

test("migration 094 owns publication authority, audit references, and personal document compatibility",()=>{const sql=readFileSync(resolve("infra/supabase/migrations/094_institution_publications.sql"),"utf8");assert.match(sql,/institution_id uuid not null references public\.institutions\(id\) on delete restrict/i);assert.match(sql,/project_id uuid not null references public\.projects\(id\) on delete restrict/i);assert.match(sql,/creator_user_id uuid references public\.profiles\(id\) on delete set null/i);assert.match(sql,/enforce_institution_publication_project_v1[\s\S]*p\.institution_id=new\.institution_id/i);assert.match(sql,/old\.creator_user_id is not null and new\.creator_user_id is null/i);assert.match(sql,/resource_kind='institution_publication'/i);assert.match(sql,/publication_created[\s\S]*publication_edited[\s\S]*publication_published[\s\S]*publication_retracted/i);assert.match(sql,/revoke all on table public\.institution_publications from public,anon,authenticated/i);assert.match(sql,/grant execute on function public\.create_institution_publication_v1[\s\S]*to service_role/i);assert.doesNotMatch(sql,/alter table public\.documents|update public\.documents|insert into public\.documents/i)});
