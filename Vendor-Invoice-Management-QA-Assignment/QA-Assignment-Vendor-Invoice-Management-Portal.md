# QA Assignment — Vendor Invoice Management Portal

## Reference: System Requirements

| ID | Requirement |
|----|-------------|
| REQ-01 | Vendors can register and log in to the portal |
| REQ-02 | Vendors can submit invoices against purchase orders |
| REQ-03 | The AP team can view, approve, or reject invoices |
| REQ-04 | Approved invoices are forwarded for payment processing |
| REQ-05 | Both parties receive email notifications on status changes |
| REQ-06 | The system generates monthly invoice activity reports |
| REQ-07 | Only authorized users may access the system |

---

# SECTION 1 — Ambiguous Requirements & Clarifying Questions

> **Shift-Left principle applied here:** The cost of fixing a defect rises sharply the later it is found:
> **Requirements ~1x → Design ~3x → Development ~10x → Testing ~40x → Production ~100x.**
> Every clarifying question below removes ambiguity *before* code exists — the cheapest possible point to fix it. Each requirement notes the **cost of not asking**.

---

## REQ-01 — Vendors can register and log in to the portal

**What is ambiguous or missing:**
- "Register" implies open self-registration — but B2B vendors are usually pre-vetted. Self-service or invite-only?
- No email verification, account-approval, or activation owner defined.
- No password policy, lockout policy, or session rules.
- "Log in" does not specify single-factor vs. multi-factor authentication.
- No statement of mandatory registration data (tax ID, bank details, company name).

**Clarifying Questions:**
1. Is registration self-service (open) or invite-only / admin-approved? Who approves a new vendor?
2. What is the password policy (min/max length, complexity, expiry, reuse history), and is MFA required?
3. After registration, is the account active immediately or pending email verification / AP approval?
4. What is the lockout rule after repeated failed logins (e.g., 5 attempts → 15-minute lock)?
5. What are the session rules — idle timeout, "remember me", behavior on concurrent logins from two devices?
6. Which fields are mandatory at registration (company name, tax ID, GST/VAT, bank account, contact email)?

**Cost of not asking:** If "active immediately" was assumed but the business wanted AP approval, unvetted vendors could submit invoices — a defect discovered in production (~100x) instead of at requirements (~1x).

---

## REQ-02 — Vendors can submit invoices against purchase orders

**What is ambiguous or missing:**
- No defined invoice fields, currency handling, or accepted file formats/sizes.
- "Against purchase orders" — must the amount match the PO? Can it exceed? Can one invoice span multiple POs?
- No rule on duplicate invoice numbers or duplicate submissions.
- No mention of line items, taxes, or rounding.
- No handling of closed, cancelled, fully-billed, or expired POs.

**Clarifying Questions:**
1. Can an invoice exceed the PO amount? Is partial billing allowed, and can multiple invoices be raised against one PO until exhausted?
2. What file formats and max file size are accepted (e.g., PDF/PNG/JPG up to 10 MB)? Multiple attachments?
3. How are duplicate invoices prevented — invoice number unique per vendor, globally, or unenforced?
4. What currencies are supported, how is currency mismatch handled, and what is the rounding/decimal-precision rule?
5. Can a vendor submit against an expired, cancelled, fully-billed, or another vendor's PO?
6. Is there a submission deadline, and can a vendor edit or withdraw an invoice before AP review?

**Cost of not asking:** If "amount may exceed PO" is left undefined, over-billing slips through to payment — a financial loss caught only in production (~100x).

---

## REQ-03 — The AP team can view, approve, or reject invoices

**What is ambiguous or missing:**
- No AP roles/permissions — can any AP user approve any amount?
- "Reject" — is a reason mandatory? Can a rejected invoice be resubmitted?
- No approval threshold / multi-level approval.
- No concurrency rule for two AP users acting at once.
- No statement on whether AP can edit invoice data.

**Clarifying Questions:**
1. Are there approval limits by role (e.g., Clerk ≤ $25,000, above needs a Manager)? Is multi-level approval required?
2. Is a rejection reason mandatory and shared with the vendor? Can a rejected invoice be corrected and resubmitted, or must a new one be raised?
3. What happens if two AP users act on the same invoice simultaneously — who wins, what does the second see?
4. Can an AP user edit invoice fields before approval, or only approve/reject as-is?
5. Can an AP user approve an invoice for a PO they are not assigned to? Is segregation of duties enforced?
6. Is there an "on hold" / "needs more info" state between Submitted and Approved/Rejected?

**Cost of not asking:** Undefined approval limits let a junior clerk approve a $1M invoice — a control gap that is a 1x checkbox at requirements but a compliance incident in production.

---

## REQ-04 — Approved invoices are forwarded for payment processing

**What is ambiguous or missing:**
- "Forwarded" to what — internal module, external ERP/gateway, or manual export?
- No behavior defined if the payment system is down or rejects the record.
- No idempotency — could the same invoice be forwarded twice?
- No timing/SLA (immediate vs. batch).
- No status tracking once forwarded ("Paid", "Failed").

**Clarifying Questions:**
1. Where are approved invoices forwarded (internal module, ERP like SAP/Oracle, payment gateway), and via what method (API, file, queue)?
2. If the payment system is unavailable or rejects the invoice, is there retry, a dead-letter queue, and alerting?
3. How is double-forwarding prevented (idempotency key) so an invoice is never paid twice?
4. Is forwarding real-time on approval or a scheduled batch? What is the SLA?
5. Are downstream statuses ("Scheduled", "Paid", "Failed") reflected back into the portal?
6. Can an approved-and-forwarded invoice be reversed/recalled, and by whom?

**Cost of not asking:** No idempotency rule → duplicate payments. Discovered after money leaves the account, this is the most expensive possible failure point (~100x).

---

## REQ-05 — Both parties receive email notifications on status changes

**What is ambiguous or missing:**
- "Both parties" — vendor + which AP user(s)? Approver, whole team, distribution list?
- "Status changes" — which exact transitions trigger an email?
- No fallback if the email service fails.
- No content, language, localization, or unsubscribe rules.
- No rate limiting — a burst of changes could spam inboxes.

**Clarifying Questions:**
1. Which transitions trigger notifications (Submitted, Approved, Rejected, Forwarded, Paid, Failed)? Any "no action in X days" reminder?
2. Who precisely is "both parties" — submitting vendor + assigned AP reviewer, the whole AP team, or a shared mailbox?
3. If email is down or bounces, is there retry, a fallback channel (in-app/SMS), and a delivery-failure log?
4. Are emails real-time per event or batched/digested? Is there rate limiting?
5. What does an email contain — does it include sensitive data (amount, bank details) that risks a leak if misaddressed?
6. Is multi-language/localization required, and is there an audit log proving a notification was sent?

**Cost of not asking:** If silent email failure isn't handled, both parties miss a rejection, the vendor never corrects it, and payment stalls — a process breakdown found in production.

---

## REQ-06 — The system generates monthly invoice activity reports

**What is ambiguous or missing:**
- "Monthly" — calendar month? By submission, approval, or payment date? Which time zone?
- No report contents, format, or recipients defined.
- Auto-generated/emailed or on-demand download?
- No definition of what counts (all statuses? approved only?).
- No data-volume/performance expectation for large vendors.

**Clarifying Questions:**
1. Is "monthly" a calendar month, and is an invoice counted by submission, approval, or payment date? Which time zone sets the boundary?
2. What columns/metrics must the report contain (count by status, total amount, average approval time, rejections)?
3. Is the report auto-emailed on schedule, downloadable on demand, or both? What formats (PDF, CSV, Excel)?
4. Who sees which report — vendor sees only their own, AP sees all? Are figures access-controlled?
5. If an invoice's status changes after the report is generated, is it an immutable snapshot or live recalculation?
6. What is the expected data volume and performance target for a report covering tens of thousands of invoices?

**Cost of not asking:** An undefined month boundary misclassifies invoices, finance reconciles wrong totals, and the error is caught only after reports ship to stakeholders.

---

## REQ-07 — Only authorized users may access the system

**What is ambiguous or missing:**
- "Authorized users" / "access" undefined — which roles, and what can each do?
- No object-level authorization (vendor seeing only *their* invoices).
- No statement on API-level vs. UI-level enforcement.
- No access audit logging.
- No deactivation/offboarding rule.

**Clarifying Questions:**
1. What roles exist (Vendor, AP Clerk, AP Manager, Admin, Auditor) and what is the permission matrix per role/action?
2. Is authorization enforced at the object level — can Vendor A ever view/download/guess Vendor B's invoice (BOLA)?
3. Is authorization enforced on every API endpoint, or only hidden in the UI (can a direct API call bypass it)?
4. When a user is deactivated or their role changes, is their active session revoked immediately?
5. Is there an audit trail of who accessed/changed what and when, and how long is it retained?
6. How are inactive accounts handled (auto-disable after N days), and what is the offboarding process for departing AP staff and terminated vendors?

**Cost of not asking:** A missing object-level-authorization requirement is exactly the BOLA defect in BUG-001 — a confidential-data breach that is a one-line requirement at 1x but a regulatory incident at 100x.

---

# SECTION 2 — Test Scenarios

> **Format:** Scenario ID | Requirement | Title | Type — 26 scenarios across 7 requirements.

| Scenario ID | Requirement | Scenario Title | Type |
|-------------|-------------|----------------|------|
| TS-01 | REQ-01 | Vendor registers successfully with valid mandatory details | Positive |
| TS-02 | REQ-01 | Registration rejected for duplicate / already-registered email | Negative |
| TS-03 | REQ-01 | Login fails and account locks after repeated wrong passwords | Negative |
| TS-04 | REQ-01 | First-time vendor completes login & lands on dashboard unaided | Usability |
| TS-05 | REQ-02 | Vendor submits a valid invoice within PO balance | Positive |
| TS-06 | REQ-02 | Invoice rejected when amount exceeds remaining PO balance | Negative |
| TS-07 | REQ-02 | Duplicate invoice number / double submission is blocked | Negative |
| TS-08 | REQ-02 | Upload rejected for unsupported file type / oversized file | Negative |
| TS-09 | REQ-02 | Submitted invoice is stored correctly with audit fields (DB) | Positive |
| TS-10 | REQ-03 | AP user approves a submitted invoice within limit | Positive |
| TS-11 | REQ-03 | AP approval honors role/amount/PO-status decision logic | Positive |
| TS-12 | REQ-03 | Two AP users acting on the same invoice simultaneously | Negative |
| TS-13 | REQ-03 | Clerk cannot approve above limit / vendor cannot approve via API | Security |
| TS-14 | REQ-04 | Approved invoice is forwarded to payment exactly once | Positive |
| TS-15 | REQ-04 | Forwarding retries gracefully when payment system is unavailable | Negative |
| TS-16 | REQ-04 | Same invoice is never forwarded twice (idempotency) | Negative |
| TS-17 | REQ-05 | Vendor and AP receive email on approval/rejection | Positive |
| TS-18 | REQ-05 | Notification failure is logged and retried, not silently dropped | Negative |
| TS-19 | REQ-05 | Sensitive notification is not sent to a stale/wrong address | Security |
| TS-20 | REQ-06 | Monthly report generates correct totals for the calendar month | Positive |
| TS-21 | REQ-06 | Report respects month boundary / time-zone edge dates | Negative |
| TS-22 | REQ-06 | Vendor report shows only that vendor's invoices | Security |
| TS-23 | REQ-06 | Report generation performs within SLA for large data volume | Performance |
| TS-24 | REQ-07 | Unauthenticated user is redirected to login | Negative |
| TS-25 | REQ-07 | Vendor A cannot access Vendor B's invoice by changing the ID (BOLA) | Security |
| TS-26 | REQ-07 | Deactivated user's active session is revoked immediately | Security |

---

# SECTION 3 — Detailed Test Cases

> Each case states its technique: **BVA**, **EP**, **Decision Table**, or **Exploratory**, and notes the layer (UI / API / DB) where relevant. Covers all 7 requirements.

---

### TC-01 — Successful vendor registration (REQ-01 / TS-01)

| Field | Detail |
|-------|--------|
| **Test Case ID** | TC-01 |
| **Scenario** | TS-01 |
| **Type** | Positive (Functional, UI) |
| **Technique** | Exploratory + EP (valid input class) |
| **Preconditions** | Portal live; `newvendor@acme-supplies.com` not registered |

**Steps:**
1. Navigate to `/register`.
2. Enter Company `Acme Supplies Pvt Ltd`, Email `newvendor@acme-supplies.com`, Tax ID `29ABCDE1234F1Z5`, Password `Vend0r@2026!`.
3. Accept terms, click **Register**.
4. Open the verification email, click the activation link.

**Test Data:** Email `newvendor@acme-supplies.com`; Password `Vend0r@2026!` (12 chars).

**Expected Result:** Account created in `Pending Verification`; verification email sent; after activation, account is `Active` and login succeeds.

---

### TC-02 — Password length boundary (REQ-01 / TS-01) — **BVA**

| Field | Detail |
|-------|--------|
| **Test Case ID** | TC-02 |
| **Scenario** | TS-01 |
| **Type** | Negative (Functional, UI) |
| **Technique** | **Boundary Value Analysis** (min=8, max=64) |
| **Preconditions** | Registration form open; password policy min 8 / max 64 |

**Test Data (BVA on length):**

| Length | Sample value | Partition | Expected |
|--------|--------------|-----------|----------|
| 7 | `Ab1@xyz` | Just below min | Rejected |
| 8 | `Ab1@xyzz` | At min | Accepted |
| 64 | 64-char valid string | At max | Accepted |
| 65 | 65-char string | Just above max | Rejected |

**Steps:** Attempt registration with each password above, all other fields valid.

**Expected Result:** 7 and 65 rejected with a clear policy message; 8 and 64 accepted.

---

### TC-03 — Account lockout after failed logins (REQ-01 / TS-03) — **BVA**

| Field | Detail |
|-------|--------|
| **Test Case ID** | TC-03 |
| **Scenario** | TS-03 |
| **Type** | Negative / Security (Functional, UI) |
| **Technique** | **BVA** on attempt count (limit = 5) |
| **Preconditions** | Active vendor `vendor1@acme-supplies.com`; lockout at 5 failed attempts |

**Steps:**
1. Enter correct email + wrong password for attempts 1–4.
2. 5th attempt: wrong password again.
3. 6th attempt: **correct** password.

**Test Data:** Email `vendor1@acme-supplies.com`; wrong `WrongPass1!`; correct `Vend0r@2026!`.

**Expected Result:** Attempts 1–4 fail with "invalid credentials"; 5th locks the account; 6th is blocked despite a correct password until cooldown elapses.

---

### TC-04 — First-time vendor submits invoice unaided (REQ-02 / TS-04) — **Usability**

| Field | Detail |
|-------|--------|
| **Test Case ID** | TC-04 |
| **Scenario** | TS-04 |
| **Type** | Usability |
| **Technique** | Exploratory (first-time-user persona) |
| **Preconditions** | A first-time vendor user with no training; valid PO `PO-10045` assigned |

**Steps:**
1. Give the user only the task: "Submit an invoice for $5,000 against your open PO."
2. Observe — without help — whether they find **Submit Invoice**, select the PO, enter data, attach a file, and submit.
3. Record any point of confusion, dead-end, or unclear label.

**Test Data:** Persona = first-time vendor; target amount `$5,000`; PO `PO-10045`.

**Expected Result:** The user completes submission within ~3 minutes without assistance; labels, required fields, and errors are self-explanatory; success confirmation is unambiguous.

---

### TC-05 — Invoice amount vs. PO balance (REQ-02 / TS-06) — **BVA + EP**

| Field | Detail |
|-------|--------|
| **Test Case ID** | TC-05 |
| **Scenario** | TS-06 |
| **Type** | Negative (Functional, UI/API) |
| **Technique** | **BVA** around limit + **EP** (invalid classes: zero, negative) |
| **Preconditions** | PO `PO-10046` remaining balance = $10,000.00 |

**Test Data:**

| Amount | Partition | Expected |
|--------|-----------|----------|
| `9,999.99` | Just below limit | Accepted |
| `10,000.00` | At limit | Accepted |
| `10,000.01` | Just above limit | Rejected |
| `0.00` | Zero (invalid class) | Rejected |
| `-100.00` | Negative (invalid class) | Rejected |

**Steps:** Submit invoices with each amount against `PO-10046`.

**Expected Result:** At/below balance accepted; above-balance, zero, and negative rejected with specific validation messages.

---

### TC-06 — File upload classes (REQ-02 / TS-08) — **EP + BVA + Security**

| Field | Detail |
|-------|--------|
| **Test Case ID** | TC-06 |
| **Scenario** | TS-08 |
| **Type** | Negative / Security (Functional, UI/API) |
| **Technique** | **Equivalence Partitioning** across file classes + **BVA** at 10 MB |
| **Preconditions** | Allowed types PDF/PNG/JPG; max size 10 MB |

**Test Data (EP classes + size boundary):**

| File | Class | Expected |
|------|-------|----------|
| `invoice.pdf` (9.9 MB) | Valid, just below limit | Accepted |
| `invoice.pdf` (10 MB) | Valid, at limit | Accepted |
| `invoice.pdf` (10.1 MB) | Valid type, above limit | Rejected (too large) |
| `malware.exe` | Invalid type | Rejected |
| `invoice.pdf.exe` | Disguised executable | Rejected |
| `xss.svg` (embedded script) | XSS-bearing file | Rejected / sanitized |
| `empty.pdf` (0 bytes) | Empty file | Rejected |

**Steps:** Attempt to attach each file and submit.

**Expected Result:** Only valid types within the limit are accepted; oversized, wrong-type, disguised, script-bearing, and empty files are rejected. Validation is **server-side**, not just client-side.

---

### TC-07 — Submitted invoice stored correctly (REQ-02 / TS-09) — **DB layer**

| Field | Detail |
|-------|--------|
| **Test Case ID** | TC-07 |
| **Scenario** | TS-09 |
| **Type** | Positive (Database) |
| **Technique** | Exploratory (data-integrity verification) |
| **Preconditions** | Invoice `INV-2026-001` just submitted via the UI by vendor ID `V-1001` against `PO-10045` |

**Steps:**
1. Query the invoices table: `SELECT * FROM invoices WHERE invoice_no = 'INV-2026-001';`
2. Verify field values and foreign keys.
3. Query the PO table to confirm the remaining balance was decremented.
4. Confirm no duplicate or orphan rows exist.

**Test Data:** `invoice_no = INV-2026-001`, `vendor_id = V-1001`, `po_id = PO-10045`, `amount = 49999.99`.

**Expected Result:** Exactly one invoice row with `status='Submitted'`, correct `amount`, valid `vendor_id`/`po_id` FKs, populated audit fields (`created_by`, `created_at`); PO balance correctly decremented; no orphan/duplicate rows.

---

### TC-08 — AP approval decision logic (REQ-03 / TS-11) — **Decision Table**

| Field | Detail |
|-------|--------|
| **Test Case ID** | TC-08 |
| **Scenario** | TS-11 |
| **Type** | Positive / Negative (Functional, API) |
| **Technique** | **Decision Table** (Role × Amount × PO Status) |
| **Preconditions** | Clerk `ap.clerk@company.com` (limit $25,000) and Manager `ap.mgr@company.com` exist; invoices prepared in each PO state |

**Decision Table:**

| Rule | Role | Amount | PO Status | Expected Outcome |
|------|------|--------|-----------|------------------|
| R1 | Clerk | ≤ $25,000 | Open | Approved |
| R2 | Clerk | > $25,000 | Open | Escalated to Manager |
| R3 | Manager | Any | Open | Approved |
| R4 | Any | Any | Expired | Rejected — invalid PO |
| R5 | Any | Any | Cancelled | Rejected — invalid PO |

**Steps:** For each rule R1–R5, log in as the stated role and attempt to approve a matching invoice.

**Test Data:** R1 `$24,999.99`/Open; R2 `$25,000.01`/Open; R3 `$80,000`/Open; R4 `$5,000`/Expired; R5 `$5,000`/Cancelled.

**Expected Result:** Each rule produces its expected outcome; no combination bypasses the limit or acts on an invalid PO.

---

### TC-09 — Concurrent action on same invoice (REQ-03 / TS-12) — **Exploratory / Concurrency**

| Field | Detail |
|-------|--------|
| **Test Case ID** | TC-09 |
| **Scenario** | TS-12 |
| **Type** | Negative (Concurrency) |
| **Technique** | Exploratory (race condition) |
| **Preconditions** | Invoice `INV-2026-011` in `Submitted`; two AP users logged in |

**Steps:**
1. AP User A and AP User B both open `INV-2026-011`.
2. User A clicks **Approve**; at nearly the same instant User B clicks **Reject**.

**Test Data:** Invoice `INV-2026-011`.

**Expected Result:** Only the first action commits; the second user sees "this invoice was already actioned by another user"; the invoice has exactly one final state — no double transition or corrupted audit trail.

---

### TC-10 — Vendor cannot approve via direct API (REQ-03 / REQ-07 / TS-13) — **API layer / Security**

| Field | Detail |
|-------|--------|
| **Test Case ID** | TC-10 |
| **Scenario** | TS-13 |
| **Type** | Security (API) |
| **Technique** | Exploratory (negative authorization) |
| **Preconditions** | Vendor `vendorB@beta-traders.com` has a valid token; invoice `INV-2026-011` is `Submitted` |

**Steps:**
1. Using the vendor's token, send `POST /api/invoices/INV-2026-011/approve` directly (bypassing the UI, which hides the button).
2. Inspect the HTTP response and the invoice status afterward.

**Test Data:** Caller = vendor token; endpoint `POST /api/invoices/INV-2026-011/approve`.

**Expected Result:** Server returns `403 Forbidden`; invoice stays `Submitted`. Authorization is enforced at the **API layer**, not just hidden in the UI.

---

### TC-11 — BOLA / unauthorized object access (REQ-07 / TS-25) — **API / Security**

| Field | Detail |
|-------|--------|
| **Test Case ID** | TC-11 |
| **Scenario** | TS-25 |
| **Type** | Security (API) |
| **Technique** | Exploratory (object-level authorization) |
| **Preconditions** | Vendor A owns invoice ID `5001`; Vendor B owns `5002`; both logged in |

**Steps:**
1. As Vendor B, call `GET /api/invoices/5001` (or change the ID in the URL).
2. Attempt to download `5001`'s attachment.

**Test Data:** Logged-in = Vendor B; target object `5001` (owned by A).

**Expected Result:** Server returns `403 Forbidden` (or `404`); Vendor B can never read, download, or modify Vendor A's invoice. Server-side enforcement, independent of UI.

---

### TC-12 — Idempotent payment forwarding (REQ-04 / TS-16) — **Integration**

| Field | Detail |
|-------|--------|
| **Test Case ID** | TC-12 |
| **Scenario** | TS-16 |
| **Type** | Negative / Integration (API) |
| **Technique** | Exploratory (idempotency) |
| **Preconditions** | Invoice `INV-2026-010` just `Approved`; payment-system mock available |

**Steps:**
1. Trigger forwarding for `INV-2026-010`.
2. Re-trigger forwarding for the same invoice (simulate retry / duplicate event).
3. Inspect the payment system for the number of records created.

**Test Data:** Invoice `INV-2026-010`; idempotency key = invoice ID.

**Expected Result:** Exactly **one** payment record exists; the duplicate trigger is recognized via the idempotency key and ignored — the invoice is never paid twice.

---

### TC-13 — Email notification on approval (REQ-05 / TS-17) — **Integration**

| Field | Detail |
|-------|--------|
| **Test Case ID** | TC-13 |
| **Scenario** | TS-17 |
| **Type** | Positive / Integration |
| **Technique** | Exploratory (notification verification) |
| **Preconditions** | Invoice `INV-2026-010` approved; SMTP/mail mock (e.g., Mailtrap) configured |

**Steps:**
1. Approve `INV-2026-010` as the AP clerk.
2. Inspect the mail sink for messages to vendor and AP addresses.
3. Verify subject, status text, and that no sensitive bank data is exposed in the body.

**Test Data:** Vendor `vendorA@acme-supplies.com`; AP `ap.clerk@company.com`; invoice `INV-2026-010`.

**Expected Result:** Both parties receive an "Invoice Approved" email within the SLA; content is correct; a delivery record is logged; no over-disclosure of sensitive data.

---

### TC-14 — Notification failure handling (REQ-05 / TS-18) — **Negative / Integration**

| Field | Detail |
|-------|--------|
| **Test Case ID** | TC-14 |
| **Scenario** | TS-18 |
| **Type** | Negative / Integration |
| **Technique** | Exploratory (external-system failure) |
| **Preconditions** | Mail service configured to fail (down or returns 5xx); invoice ready to approve |

**Steps:**
1. Take the mail service offline (mock failure).
2. Approve an invoice to trigger a notification.
3. Inspect logs, retry queue, and any fallback channel.

**Test Data:** Invoice `INV-2026-012`; mail service forced offline.

**Expected Result:** Failure is logged with a clear error, the message is queued for retry (not silently dropped), and an in-app fallback notification is created. State change still succeeds even though email failed.

---

### TC-15 — Monthly report correctness & boundary (REQ-06 / TS-20, TS-21) — **BVA on dates**

| Field | Detail |
|-------|--------|
| **Test Case ID** | TC-15 |
| **Scenario** | TS-20, TS-21 |
| **Type** | Positive / Negative (Functional, DB) |
| **Technique** | **BVA** on the month boundary |
| **Preconditions** | Invoices seeded with known timestamps around a month boundary (time zone defined) |

**Test Data (BVA on May→June 2026 boundary):**

| Invoice | Timestamp | Belongs to report |
|---------|-----------|-------------------|
| `INV-A` | `2026-05-31 23:59:59` | May |
| `INV-B` | `2026-06-01 00:00:00` | June |
| `INV-C` | `2026-06-30 23:59:59` | June |
| `INV-D` | `2026-07-01 00:00:00` | July (not June) |

**Steps:** Generate the **June 2026** report; verify which invoices are included and the totals.

**Expected Result:** The June report includes `INV-B` and `INV-C` only; `INV-A` and `INV-D` are excluded; totals (count and amount) match the seeded data exactly.

---

# SECTION 4 — Bug Report Template + Sample Bug

> **Severity vs Priority (one-line):** *Severity* = how badly the defect hurts the system (technical/business impact); *Priority* = how urgently it must be fixed (business scheduling). They are independent — e.g., a typo on the homepage is Low severity but High priority, while a crash in a rarely used admin export is High severity but Low priority.

## Bug Report Template

| Field | Description |
|-------|-------------|
| **Bug ID** | Unique identifier |
| **Title** | One-line summary |
| **Module / Feature** | Affected area |
| **Environment** | Build / OS / browser / API version |
| **Severity** | Critical / High / Medium / Low (impact) |
| **Priority** | P1 / P2 / P3 / P4 (urgency) |
| **Preconditions** | State required before reproduction |
| **Steps to Reproduce** | Numbered, exact steps |
| **Test Data** | Specific values used |
| **Expected Result** | What should happen |
| **Actual Result** | What actually happened |
| **Attachments** | Screenshots, logs, network trace |
| **Reported By / Date** | Reporter and date |
| **Status** | New / Open / In Progress / Fixed / Retest / Closed / Reopened |

---

## Sample Bug — BUG-001

| Field | Detail |
|-------|--------|
| **Bug ID** | BUG-001 |
| **Title** | Vendor can view another vendor's invoice by changing the invoice ID in the URL (BOLA) |
| **Module / Feature** | REQ-07 Authorization / Invoice details API |
| **Environment** | Build 1.4.0-rc2, Chrome 126, API v1, Staging |
| **Severity** | **Critical** (confidential financial data of another company exposed) |
| **Priority** | **P1** (immediate — data breach / compliance violation) |
| **Preconditions** | Two active vendors: Vendor A owns invoice ID `5001`; Vendor B is logged in and owns `5002` |
| **Steps to Reproduce** | 1. Log in as Vendor B. 2. Open own invoice `https://portal.example.com/invoices/5002`. 3. Manually change the URL to `/invoices/5001`. 4. Press Enter. |
| **Test Data** | Logged-in user `vendorB@beta-traders.com`; target object invoice `5001` (owned by Vendor A) |
| **Expected Result** | System returns `403 Forbidden`; Vendor B cannot see Vendor A's invoice, amount, or attachment |
| **Actual Result** | Full invoice `5001` is displayed — amount `$49,999.99`, PO number, and downloadable PDF — exposing Vendor A's confidential data to Vendor B |
| **Attachments** | `bug001-screenshot.png`, `bug001-network.har` |
| **Reported By / Date** | QA Engineer / 2026-06-12 |
| **Status** | New |

---

# SECTION 5 — Requirements Traceability Matrix (RTM)

Every requirement maps to **at least 2 test cases** — no gaps.

| Req ID | Requirement | Test Scenarios | Test Cases | Status |
|--------|-------------|----------------|------------|--------|
| REQ-01 | Vendors can register and log in | TS-01, TS-02, TS-03, TS-04 | TC-01, TC-02, TC-03 | Not Executed |
| REQ-02 | Submit invoices against POs | TS-05–TS-09 | TC-04, TC-05, TC-06, TC-07 | Not Executed |
| REQ-03 | AP view / approve / reject | TS-10, TS-11, TS-12, TS-13 | TC-08, TC-09, TC-10 | Not Executed |
| REQ-04 | Forward approved to payment | TS-14, TS-15, TS-16 | TC-12 (+ TC-13 trigger) | Not Executed |
| REQ-05 | Email notifications on status change | TS-17, TS-18, TS-19 | TC-13, TC-14 | Not Executed |
| REQ-06 | Monthly activity reports | TS-20, TS-21, TS-22, TS-23 | TC-15 (+ report-perf TC) | Not Executed |
| REQ-07 | Only authorized users access | TS-24, TS-25, TS-26 | TC-10, TC-11 | Not Executed |

> **Status legend:** Not Executed / Pass / Fail. **Coverage note:** REQ-04 leans on TC-12 (idempotency) plus the forwarding trigger exercised in TC-13; REQ-06 leans on TC-15 (boundary correctness) plus a dedicated performance case (TS-23) to be scripted in JMeter. Both are explicitly flagged rather than silently omitted — honest coverage reporting is part of the QA discipline.

---

# SECTION 6 — Edge Cases to Test

> Driven by the **QA mindset** questions: unexpected user action, concurrency, external-system failure, invalid/missing data, and regression ("what if the fix breaks something else?").

| ID | Feature | Mindset Question | Edge Case | Why It Matters |
|----|---------|------------------|-----------|----------------|
| EC-01 | Approval (REQ-03) | Concurrency | Two AP users approve/reject the same invoice simultaneously | Race condition can double-transition state or corrupt the audit trail |
| EC-02 | Login/Session (REQ-01/07) | Unexpected action | Session expires mid-submission of a large invoice | Silent data loss / half-saved record; the user must be told, not just dropped |
| EC-03 | Invoice submit (REQ-02) | Unexpected action | Same invoice submitted twice via double-click or network retry | Duplicate invoices → duplicate payments; idempotency must hold server-side |
| EC-04 | Invoice amount (REQ-02) | Invalid data | Amount `0.00`, negative, or `0.001` (sub-cent) | Zero/negative invoices are nonsensical; sub-cent values expose rounding bugs |
| EC-05 | Invoice fields (REQ-02) | Invalid data | Unicode/emoji/SQL in company name (`'; DROP TABLE--`) | Injection and rendering bugs; must be sanitized and stored safely |
| EC-06 | File upload (REQ-02) | Unexpected action | Executable disguised as PDF, zip bomb, or 10.0001 MB file | File-upload abuse is a top attack vector; the size boundary must be exact |
| EC-07 | Amount boundary (REQ-02) | Invalid data | Invoice exactly equal to, and one cent over, the PO balance | Off-by-one (`>=` vs `>`) lets over-billing slip through |
| EC-08 | Purchase Order (REQ-02) | Invalid data | Submitting against an expired, cancelled, or fully-billed PO | Invoices against invalid POs create downstream payment disputes |
| EC-09 | Account state (REQ-01/07) | External system / process fails | Deactivated vendor with a still-valid session keeps acting | Offboarding gap → unauthorized access after deactivation |
| EC-10 | Reporting (REQ-06) | Invalid data | Invoice at `23:59:59` month-end vs `00:00:00` next day across time zones | Month-boundary / time-zone bugs misclassify which report an invoice lands in |
| EC-11 | Notifications (REQ-05) | External system fails | Email service down or recipient bounces | Silent notification loss leaves both parties unaware of approvals/rejections |
| EC-12 | Payment (REQ-04) | External system fails | Payment system rejects/times out after invoice marked Approved | Invoice stuck in limbo — "approved" in portal but never paid |
| EC-13 | Reporting (REQ-06) | Unexpected action (frustrated power-user) | Report for a vendor with tens of thousands of invoices | Timeout/slowness; large data sets must paginate or stream |
| EC-14 | Authorization (REQ-07) | Unexpected action | Direct API call (`POST /api/invoices/{id}/approve`) by a vendor | UI-only authorization is no authorization; must be enforced at the API |
| EC-15 | Regression (all) | Regression after fix | After fixing the BOLA bug (BUG-001), confirm legitimate vendors can still view their *own* invoices | A security fix that over-restricts breaks valid access — every fix needs a regression pass |

---

# SECTION 7 — Test Approach

## 7.0 — User Personas (whose eyes we test through)

We deliberately test from three perspectives, not just the "happy path" user:

| Persona | Mindset | What we test for them | Portal example |
|---------|---------|-----------------------|----------------|
| **First-time user** | Unsure, no training, reads labels literally | Discoverability, clear labels, self-explanatory errors | A brand-new vendor submits their first invoice unaided (TC-04) |
| **Frustrated user** | In a hurry, double-clicks, retries, abandons | Resilience to impatient/erratic actions, no data loss | Vendor double-clicks **Submit** and hits Back mid-upload (EC-03) — no duplicate invoice |
| **Business user** | Cares about outcomes, accuracy, reporting | Correctness of money figures, reports, and audit data | AP manager relies on the monthly report totals being exactly right (TC-15) |

These personas drive the usability cases (7b) and many edge cases (Section 6).

## 7a — Testing Objectives (the 6 course objectives)

Our approach is driven by the six objectives of testing:

1. **Build confidence** — green regression + UAT sign-off give stakeholders confidence to release.
2. **Find bugs early** — Shift-Left: requirements review (Section 1) and unit tests catch defects at 1x–10x, not 100x.
3. **Verify requirements** — the RTM proves every REQ is covered (verification: "did we build it right?").
4. **Validate user needs** — UAT and usability tests confirm the AP team and vendors can actually do their jobs ("did we build the right thing?").
5. **Measure quality** — pass rate, defect density, severity distribution, and coverage % are tracked as exit metrics.
6. **Reduce risk** — risk-based prioritization (Section 8) focuses effort on Critical/High areas like BOLA and double payment.

## 7b — Testing Types

| Type | What is tested | Tools (example) | Why needed |
|------|----------------|-----------------|------------|
| **Functional (UI)** | Registration, login, submission, approve/reject on the UI | Selenium, Playwright, Cypress | Confirms user-facing behavior matches requirements |
| **API** | Endpoints (submit/approve/forward), auth, validation, status codes | Postman, REST Assured | Validates logic independent of UI; catches what the UI hides (e.g., BOLA, TC-10) |
| **Database** | Data integrity, status transitions, audit fields, no orphan/duplicate rows | SQL clients, DBUnit | Ensures stored data is correct, consistent, auditable (TC-07) |
| **Security** | AuthN/AuthZ, BOLA, SQL/XSS injection, file-upload abuse, sessions | OWASP ZAP, Burp Suite | Financial B2B data must be protected; a breach is Critical/P1 |
| **Performance** | Concurrent logins, bulk submission, large monthly reports | JMeter, k6, Gatling | Month-end spikes must not crash or slow the system |
| **Integration** | Payment gateway/ERP forwarding, email service, retries & failures | WireMock, Mailtrap, contract tests | External systems fail — verify graceful handling and idempotency |
| **Usability** | Can a first-time vendor complete a task without help? (TC-04) | Moderated sessions, heuristic eval | Adoption fails if real users can't complete core tasks |
| **Documentation** | Does the user guide / help text match the actual UI and flows? | Manual review against build | Mismatched docs cause support tickets and user error |
| **UAT** | Real AP team + vendors validate end-to-end against business needs | Manual, business sign-off | Confirms fitness for real-world use before go-live |
| **Regression** | Re-run core suite after each change/build (e.g., after BUG-001 fix, EC-15) | Automated CI suite | Prevents new code from breaking existing behavior |

## 7c — Testing Pyramid

```
        /\          Few   — E2E / UI tests (slow, expensive, brittle)
       /  \                 → critical journeys only (register → submit → approve → forward)
      /----\        Some  — Integration / API tests (medium speed)
     /      \               → business logic, contracts, auth, payment & email
    /--------\      Many  — Unit tests (fast, cheap, isolated)
   /__________\             → amount validation, password rules, boundary & rounding logic
```

- **Many unit tests** at the base — fast, cheap; validation, boundaries, rounding.
- **Some integration/API tests** in the middle — endpoints, authorization, forwarding, notifications.
- **Few E2E/UI tests** at the top — slow, expensive; reserved for critical journeys.

Fast feedback at the bottom catches most defects cheaply — directly reinforcing **Shift-Left**.

## 7d — Testing Levels

| Level | Scope | Example here |
|-------|-------|--------------|
| **Unit** | Single function/component in isolation | Password-length validator (TC-02 logic) |
| **Integration** | Two or more modules together | Approval → payment forwarding (TC-12), email trigger (TC-13) |
| **System** | The whole application end-to-end | Full submit → approve → forward → notify flow |
| **Acceptance (UAT)** | Business validates against real needs | AP team signs off on the approval workflow |

## 7e — Multi-Layer Testing Strategy (UI + API + DB)

Each major feature is tested at all three layers, because a bug at a lower layer can bypass an upper-layer control:

| Feature | UI layer | API layer | DB layer |
|---------|----------|-----------|----------|
| **Invoice submission** | Form validation, error messages (TC-05) | `POST /api/invoices` validation can't be bypassed (server-side) | Row stored with correct FKs & audit fields (TC-07) |
| **Approval** | Approve/Reject buttons, role-based visibility | Vendor can't approve via direct API (TC-10) | Status transition + approver/timestamp persisted, single final state |

> A vendor who never sees an "Approve" button (UI) can still call the API directly — so the API layer must enforce authorization independently. This is why UI-only validation is never sufficient.

## 7f — Limitations of Testing

> *"Testing shows the presence of defects, not their absence."* — **Edsger W. Dijkstra**

- Testing can prove a bug **exists**, but never proves a system is **bug-free**.
- **100% coverage is impossible** — input combinations, timing, and environments are effectively infinite.
- Therefore we use **risk-based** techniques (BVA, EP, decision tables) to get maximum defect-finding power from a finite set of tests.
- **Implication for sign-off:** "all tests passed" means *no defects were found by the tests we ran*, not *no defects exist*. Exit criteria are framed around acceptable **residual risk**, not perfection.

## 7g — Entry & Exit Criteria

**Entry Criteria:**
- Requirements reviewed and clarifying questions (Section 1) answered/signed off.
- Test environment, test data, and a stable build deployed.
- Test cases reviewed and approved; credentials for all roles provisioned.
- Integration mocks/stubs (payment, email) available.

**Exit Criteria:**
- 100% of planned test cases executed.
- No open **Critical** or **High** severity defects (P1/P2).
- ≥ 95% test-case pass rate; all failures triaged.
- RTM shows every requirement covered and passed.
- Regression suite green; UAT sign-off obtained.

---

# SECTION 8 — Hidden Risks

| Risk ID | Category | Severity | Description | Recommendation |
|---------|----------|----------|-------------|----------------|
| R-01 | Security (BOLA) | Critical | A vendor can access another vendor's invoices by manipulating IDs in the URL/API, exposing confidential financial data | Enforce object-level authorization server-side on every endpoint; add automated BOLA tests |
| R-02 | Security (File Upload) | High | Malicious files (executables disguised as PDF, scripts, zip bombs) uploaded as attachments | Server-side type/size validation, content scanning, store outside web root, AV scan |
| R-03 | Data Integrity (Audit Trail) | High | No tamper-proof record of who approved/rejected/changed an invoice and when | Immutable, append-only audit log for every state change; required for finance compliance |
| R-04 | Integration (Silent Failure) | High | Payment or email service is down/slow; invoices never paid or parties never notified, with no alert | Retries, dead-letter queue, idempotency keys, and alerting on integration failures |
| R-05 | Compliance (Data Retention) | High | Financial records may need 7+ years retention (tax/audit law); no retention or deletion policy defined | Define & enforce retention + secure-deletion policy aligned to local financial regulation |
| R-06 | Performance (Month-End Spike) | Medium | Vendors rush submissions and reports run at month-end, spiking load and degrading the system | Load-test month-end peaks; autoscale or queue report generation; paginate large reports |
| R-07 | Business (Invoice Versioning) | Medium | A corrected-and-resubmitted invoice overwrites history with no version trail | Version invoices instead of overwriting; keep prior versions and rejection reasons linked |
| R-08 | Business (No Fallback Notification) | Medium | Notifications rely solely on email; silent delivery failure means parties miss critical updates | Add in-app notification center as fallback + delivery-failure logging and retry |
| R-09 | Session Management (Offboarding) | High | Deactivated vendors or departed AP staff retain valid sessions/tokens and can still act | Revoke sessions immediately on deactivation/role change; short token lifetimes |
| R-10 | Data Integrity (Double Payment) | Critical | Duplicate submission or duplicate forwarding leads to the same invoice being paid twice | Enforce unique invoice numbers + idempotency keys end-to-end from submission to payment |

---

*End of document — QA Assignment, Vendor Invoice Management Portal.*
