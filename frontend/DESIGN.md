Visual rules
- No purple gradients. No gradients at all unless asked.
- No pill-shaped buttons. Buttons use a border-radius of 4px to 6px.
- No emoji. Icons only from the self-hosted Material Symbols Outlined font, as used in the design.
- No cursor animations and no scroll-triggered animations.
- No AI-generated photos. Do not add stock or placeholder photos.

Content rules
- No fake reviews, testimonials, customer counts, statistics, or metrics.
- No vague hero text such as "Revolutionize your health". Headings say plainly what the page does.
- Do not use em dashes anywhere in code, copy, or comments. Use commas, colons, or full stops.
- No marketing filler. Copy is short, plain, and factual.
- Any placeholder or mock data must be clearly labelled "Sample data" in the UI.

Project rules
- Styling uses Tailwind CSS v4 with the tokens in src/index.css. No UI component library. The existing ResultView keeps its own plain CSS.
- The result screen must only draw this exact shape: { type, outcome, warnings: [{level, text}], sections: [{title, body, sources: []}], disclaimer }
- Never show text like "it is safe", never show a dose, never say "you have [disease]".
- Always show the disclaimer: "MediSense gives general information from verified sources. It is not medical advice and does not replace a doctor or pharmacist."
- No made-up identifiers (document refs, session IDs, batch numbers, monograph IDs, version numbers). No named sources in sample data. Every sample source line reads exactly: Sample source (not real).
- No "Made with AI" or similar tags or badges anywhere.

Launch checklist (do not remove or change)
- Favicon added
- Privacy policy page at /privacy
- Terms and conditions page at /terms
- Custom domain connected (only if the app is deployed)
- "Made with AI" tag removed
