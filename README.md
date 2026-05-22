# AI Compliance Officer

A tool to automatically audit AI system documentation, prompts, or outputs against regulatory standards (GDPR, AI Act, HIPAA, etc.).

## Features
- Check text for compliance risks (PII, bias, prohibited content)
- Score compliance level (0–100)
- Explain violations with suggestions

## Setup

1. Clone the repo
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
'''
    export OPENAI_API_KEY="your-key"

    Example
Input: "This AI stores user chat history indefinitely without consent."

Output:

Compliance Score: 25/100

Violations: GDPR Art. 5 (storage limitation), Art. 7 (consent)

Suggestion: Implement data retention policy and consent mechanism.

Single-file code
All logic is inside compliance_officer.py. Just run it.


### compliance_officer.py (single file, runnable example)

```python
import os
import re
from typing import List, Dict

# ---------- Mock compliance rules (extend as needed) ----------
COMPLIANCE_RULES = [
    {
        "name": "PII Detection",
        "regulation": "GDPR Art. 4(1)",
        "pattern": r"\b(email|phone|ssn|address|credit card|aadhar|pan)\b",
        "message": "Personally identifiable information detected without masking/minimization."
    },
    {
        "name": "Consent Requirement",
        "regulation": "GDPR Art. 7",
        "pattern": r"\b(without consent|no opt-out|forced|mandatory sharing)\b",
        "message": "User consent not clearly obtained or withdrawal not allowed."
    },
    {
        "name": "Storage Limitation",
        "regulation": "GDPR Art. 5(1)(e)",
        "pattern": r"\b(keep forever|indefinite storage|no deletion)\b",
        "message": "Data retention period is not defined or excessive."
    },
    {
        "name": "Bias / Discrimination",
        "regulation": "EU AI Act Art. 10",
        "pattern": r"\b(race|gender bias|unfair|discriminat(ory|ing))\b",
        "message": "Potential algorithmic bias or discrimination."
    }
]

class AIComplianceOfficer:
    def __init__(self):
        self.rules = COMPLIANCE_RULES

    def audit_text(self, text: str) -> Dict:
        findings = []
        for rule in self.rules:
            if re.search(rule["pattern"], text, re.IGNORECASE):
                findings.append({
                    "rule": rule["name"],
                    "regulation": rule["regulation"],
                    "violation": rule["message"],
                    "suggestion": self._get_suggestion(rule["name"])
                })
        score = max(0, 100 - len(findings) * 20)  # each violation deducts 20
        return {
            "compliance_score": score,
            "violations_count": len(findings),
            "findings": findings,
            "overall_status": "Pass" if score >= 80 else "Review needed" if score >= 50 else "Fail"
        }

    def _get_suggestion(self, rule_name: str) -> str:
        suggestions = {
            "PII Detection": "Anonymize or pseudonymize PII. Obtain legal basis for processing.",
            "Consent Requirement": "Implement clear opt-in/opt-out and consent records.",
            "Storage Limitation": "Define and enforce data retention policy with automated deletion.",
            "Bias / Discrimination": "Conduct fairness audit, use debiasing techniques, document limitations."
        }
        return suggestions.get(rule_name, "Review relevant regulation and adjust system design.")

def main():
    print("=== AI Compliance Officer ===")
    print("Enter text to audit (type 'exit' to quit):")
    officer = AIComplianceOfficer()
    while True:
        text = input("\n> ")
        if text.lower() in ["exit", "quit"]:
            break
        result = officer.audit_text(text)
        print(f"\nCompliance Score: {result['compliance_score']}/100")
        print(f"Status: {result['overall_status']}")
        if result["findings"]:
            print("Violations found:")
            for f in result["findings"]:
                print(f"  - {f['rule']} ({f['regulation']}): {f['violation']}")
                print(f"    Suggestion: {f['suggestion']}")
        else:
            print("No clear violations detected.")

if __name__ == "__main__":
    main()
```

To run: Save as 
```bash
compliance_officer.py
```
and run with 
```bash
python compliance_officer.py.
"# AI-COMPILANCE-INTELLIGENCE-SYSTEM" 
