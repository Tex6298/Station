# PR434 NVIDIA Provider Data-Policy Preflight

Run:

`docs/roadmap/PR434_NVIDIA_PROVIDER_DATA_POLICY_PREFLIGHT_ARGUS.md`

PR433 proved synthetic-only NVIDIA routeability. It did not approve private
product/replay context through NVIDIA.

Decide the provider/data-policy boundary before any real replay product lane:
which modes are acceptable, what data may leave Station, what observability and
usage-accounting gates are required, and whether the exact-output caveat blocks
anything beyond routeability.

Wake MIMIR with the verdict. Wake DAEDALUS only for a concrete repo defect or
exact narrow patch.
