# Shannon Setup Track
> Updated: 2026-03-18

- Shannon is a separate setup and infrastructure track for the portfolio audit workflow.
- It is intentionally excluded from the canonical 20-app product matrix.

## Current Structure

| Component | Path |
| --- | --- |
| CLI root | `E:/Yc_ai/shannon` |
| Web dashboard | `E:/Yc_ai/shannon/web` |
| MCP server | `E:/Yc_ai/shannon/mcp-server` |
| Web env template | `E:/Yc_ai/shannon/web/.env.example` |

## Readiness Signals

| Check | Status |
| --- | --- |
| CLI root present | yes |
| Web app present | yes |
| MCP server present | yes |
| Paddle variables documented in web env | yes |
| Supabase variables documented in web env | yes |

## Next Work

1. Audit Shannon web auth, billing, and env handling separately from the product portfolio readiness score.
2. Document how Shannon consumes BMAD outputs and app audits so the setup track is traceable.
3. Review deployment docs before production use.
