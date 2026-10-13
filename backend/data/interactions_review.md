# Interaction Review

Human verification is required before any pair is marked verified. No pair is currently verified.

| Pair | Severity | Current note | Current source | Verified source URL (human fills in) |
|---|---|---|---|---|
| warfarin + ibuprofen | major | Taking these medicines together can increase the risk of serious bleeding. Contact your doctor or pharmacist before the next dose. | To verify | |
| warfarin + aspirin | major | Taking these medicines together can increase the risk of serious bleeding. Contact your doctor or pharmacist before the next dose. | To verify | |
| warfarin + diclofenac | major | Taking these medicines together can increase the risk of serious bleeding and stomach bleeding. Contact your doctor or pharmacist before the next dose. | To verify | |
| warfarin + naproxen | major | Taking these medicines together can increase the risk of serious bleeding and stomach bleeding. Contact your doctor or pharmacist before the next dose. | To verify | |
| clopidogrel + aspirin | moderate | These antiplatelet medicines can add to the risk of bleeding. Ask a doctor or pharmacist before taking them together. | To verify | |
| clopidogrel + ibuprofen | moderate | Ibuprofen may add to the risk of bleeding with clopidogrel and can irritate the stomach. Ask a doctor or pharmacist before taking them together. | To verify | |
| clopidogrel + diclofenac | moderate | Diclofenac may add to the risk of bleeding with clopidogrel and can irritate the stomach. Ask a doctor or pharmacist before taking them together. | To verify | |
| clopidogrel + naproxen | moderate | Naproxen may add to the risk of bleeding with clopidogrel and can irritate the stomach. Ask a doctor or pharmacist before taking them together. | To verify | |
| warfarin + clopidogrel | major | Taking these medicines together can increase the risk of serious bleeding. Contact your doctor or pharmacist before the next dose. | To verify | |
| warfarin + ciprofloxacin | moderate | Ciprofloxacin can affect the action of warfarin and may increase bleeding risk. Ask a doctor or pharmacist before taking them together. | To verify | |
| warfarin + azithromycin | moderate | Azithromycin can affect the action of warfarin and may increase bleeding risk. Ask a doctor or pharmacist before taking them together. | To verify | |
| warfarin + doxycycline | moderate | Doxycycline can affect the action of warfarin and may increase bleeding risk. Ask a doctor or pharmacist before taking them together. | To verify | |
| warfarin + prednisolone | moderate | Prednisolone may add to the bleeding risk associated with warfarin. Ask a doctor or pharmacist before taking them together. | To verify | |
| clopidogrel + omeprazole | moderate | Omeprazole may reduce how much clopidogrel is changed into its active form. Ask a doctor or pharmacist before taking them together. | To verify | |
| ibuprofen + aspirin | moderate | These medicines can add to stomach irritation and bleeding risk. Ask a doctor or pharmacist before taking them together. | To verify | |
| ibuprofen + diclofenac | moderate | Both medicines can add to stomach irritation and effects on the kidneys. Ask a doctor or pharmacist before taking them together. | To verify | |
| ibuprofen + naproxen | moderate | Both medicines can add to stomach irritation and effects on the kidneys. Ask a doctor or pharmacist before taking them together. | To verify | |
| diclofenac + naproxen | moderate | Both medicines can add to stomach irritation and effects on the kidneys. Ask a doctor or pharmacist before taking them together. | To verify | |
| aspirin + diclofenac | moderate | These medicines can add to stomach irritation and bleeding risk. Ask a doctor or pharmacist before taking them together. | To verify | |
| prednisolone + ibuprofen | moderate | Prednisolone and ibuprofen can add to stomach irritation and bleeding risk. Ask a doctor or pharmacist before taking them together. | To verify | |
| prednisolone + aspirin | moderate | Prednisolone and aspirin can add to stomach irritation and bleeding risk. Ask a doctor or pharmacist before taking them together. | To verify | |
| prednisolone + metformin | moderate | Prednisolone can affect blood sugar and may make blood sugar control harder with metformin. Ask a doctor or pharmacist before taking them together. | To verify | |
| telmisartan + ibuprofen | moderate | Ibuprofen may affect the kidneys and reduce the blood pressure effect of telmisartan. Ask a doctor or pharmacist before taking them together. | To verify | |
| telmisartan + diclofenac | moderate | Diclofenac may affect the kidneys and reduce the blood pressure effect of telmisartan. Ask a doctor or pharmacist before taking them together. | To verify | |
| telmisartan + naproxen | moderate | Naproxen may affect the kidneys and reduce the blood pressure effect of telmisartan. Ask a doctor or pharmacist before taking them together. | To verify | |
| ciprofloxacin + metformin | moderate | Ciprofloxacin may affect blood sugar control when taken with metformin. Ask a doctor or pharmacist before taking them together. | To verify | |
| ciprofloxacin + ondansetron | moderate | These medicines may both affect heart rhythm in some people. Ask a doctor or pharmacist before taking them together. | To verify | |
| azithromycin + ondansetron | moderate | These medicines may both affect heart rhythm in some people. Ask a doctor or pharmacist before taking them together. | To verify | |
| doxycycline + calcium carbonate | moderate | Calcium carbonate may reduce how much doxycycline is absorbed. Ask a doctor or pharmacist before taking them together. | To verify | |
| ciprofloxacin + calcium carbonate | moderate | Calcium carbonate may reduce how much ciprofloxacin is absorbed. Ask a doctor or pharmacist before taking them together. | To verify | |
| cetirizine + levocetirizine | moderate | These medicines have similar antihistamine effects and may add to drowsiness. Ask a doctor or pharmacist before taking them together. | To verify | |
| telmisartan + amlodipine | minor | These medicines can have additive effects on blood pressure. Ask a doctor or pharmacist before taking them together. | To verify | |

## Verification rule

`backend/tools/interactions.py` requires every record to have exactly these fields: `drug_a`, `drug_b`, `severity`, `note`, `source`, and `verified`. A pair counts as verified only when its JSON value is the boolean `true`, written as:

```json
"verified": true
```

The current records all use `"verified": false`, so the configured pairwise interactions are intentionally ignored until a human adds a source URL and verifies them.

Missing non-empty `source` fields: none.
