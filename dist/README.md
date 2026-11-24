# JOGENERATEqa3 — Live Repository Studio

## Page 1 — From a fixed shortlist to a live workspace

JOGENERATEqa displayed a saved list of 40 projects and packaged a single cbonsai browser port. This release retains that list as an explicitly historical reference, keeps the gold JO workspace, and adds live selection and generation. The legacy Bonsai Studio source, licence, extended README and upstream README remain in the distribution under legacy-bonsai.

The studio uses candidate data from public feeds and asks the Groq model you choose to rank it. Results are grouped by platform. A new run can yield a different list even when the feeds have not changed because ranking is an AI judgment. The model does not decide which hosts to contact or supply replacement URLs. Always inspect the original repository before making decisions about quality or adoption.

Generated projects are independent, offline-capable browser companions to a selected repository. They can be checklists, reference guides, or planners. They do not contain the upstream repository or claim to implement its original application. This distinction matters for projects that need native binaries, private services, package installation, or other platform prerequisites.

## Page 2 — Groq setup and model availability

Enter a Groq API key and click Save key. The studio checks the key using Groq’s active model endpoint. The model menu combines a catalogue of more than ten identifiers with compatible-looking models returned to your account. Some catalogue entries may be retired, enterprise-only, or unavailable to the supplied key. The browser does not mark an option as usable solely because it appears in the menu.

Choose a model and click Save model. The studio makes a small JSON chat request to confirm the model can handle the required response format. Until both steps succeed, the workflow stays locked; documentation and language selection remain accessible. On reload the browser checks the saved key and model before reopening the workspace.

Credentials are saved in this browser profile and sent directly to Groq. They are never sent to the repository feed service and are omitted from exported ZIPs. Use Forget Groq settings before leaving a shared device. Groq account quotas and costs apply; the app does not purchase access or make calls in the background while closed.

## Page 3 — Running JOGENERATE and interpreting a snapshot

Click View JOGENERATE prompt to see the exact ranking instruction. Run JOGENERATE supplies up to 60 candidates from each feed to Groq and asks it to choose exactly ten per host. Retrieval dates and ranking time are shown separately. Rankings prioritize originality, practical use, and evidence of code or documentation. Each record includes a concise example. Fork and scan-copy flags are evidence-based where supplied; unknown remains unknown.

GitHub uses its indexed repository search, limited to creation in the last 30 days. GitLab uses the public project API sorted by creation. Bitbucket uses the Atlassian public workspace and is not a global listing. SourceForge uses its public directory sorted by last update; it cannot claim creation-date ordering. Provider delays, limits, blocks, and sparse metadata can affect a run.

The studio only publishes a snapshot after validating all 40 selections. The hosted studio uses browser-accessible feeds first and automatically falls back to the published candidate snapshot. SourceForge uses the published snapshot on static hosts. Published data keeps its retrieval date and is never labelled live. Import candidate JSON can replace any feed on the next run. If ranking fails, the previous complete shortlist stays available. Use recent, independently retrieved candidates and state exactly how they were gathered. Imported data is visibly labelled.

## Page 4 — Review, edit and generate

Open Repositories, filter by host or search by text, then click a record to see its description, original link, example and notes. Pin keeps a window open when Escape closes an unpinned window. Each window scrolls independently, and wider content can be scrolled horizontally. Choose Open original if the host declines to display in a frame.

Edit saves record changes in the current browser. URL edits must use HTTPS and belong to the same platform. Select is beside Edit, and the selected record is shown in the workspace. Edits follow a repository URL across refreshes if that original record is still present. A new generation is needed after changing the selected record or its details.

Generate application sends the selected repository’s description and example to Groq. The response is validated as data and placed in a gold HTML template. Render & preview opens the exact HTML that will be downloaded. Check generated guidance for accuracy before sharing; examples are suggestions rather than evidence of upstream features.

## Page 5 — Export and verification

Download project ZIP creates a complete companion package with a Europe/London timestamp, JO_YYYYMMDD_HHMMSS.zip. It contains the standalone dist/index.html, generated spec, timestamped manifest, edited shortlist, source links, gold PDF and operating documents. No Groq key or account is needed to open an exported companion.

For the studio itself, use the private hosted version or extract JOGENERATEqa3.zip and run npm run dev with Node.js 22 or newer. The same lightweight service delivers the application and public feed adapter. No npm packages or platform API keys are required. Live operation still needs network access to the public feeds and Groq.

The selected companion source is generated by the fixed renderer from a validated JSON spec. The studio never runs upstream repository scripts. The supplied automated QA checks feed parsing, shortlist validation, URL constraints, rendering, and ZIP integrity; see TESTS.md for the distinction between mocked checks and live account verification.
