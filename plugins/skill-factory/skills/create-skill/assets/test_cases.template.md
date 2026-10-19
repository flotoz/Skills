# Test Cases for <skill-name>

Run them with fresh subagents — see the create-skill evals guide.

## Case 1: Happy path

**Input**: "<what a real user would type, in their language>"
**Expected Output**:

- <observable behaviour 1>
- <observable behaviour 2>

## Case 2: Missing prerequisite

**Input**: "<same kind of request>" with <tool / file / connection> unavailable.
**Expected Output**:

- No invented result.
- Explains what is missing and how to fix it, then asks the user to confirm.

## Case 3: Request to refuse or challenge

**Input**: "<a request outside the skill's rules>"
**Expected Output**:

- Declines or challenges it with the reason.
- Offers what it can do instead.
