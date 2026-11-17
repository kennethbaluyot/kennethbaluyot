# Trimmed Appointment Booking: Prompt Engineering Log

Rename the techniques to match the exact frameworks from your class if they differ.

## 1. Plan (role + goal + constraints)
**Prompt:** "You are a senior front-end developer. Build a frontend-only appointment booking interface with HTML, CSS, JavaScript and Bootstrap 5. Constraints: sample services and staff in JS, localStorage for bookings, responsive from 360px up, accessible. Before coding, list the booking steps, the availability rules, and the edge cases."
**Technique:** role prompting, explicit constraints, plan-first (chain of thought).
**Result:** 4 steps (service, barber, time, details). Rules: shop open Mon-Sat 9-5, each barber has working days, a booking blocks its full duration, no double booking, no past times.

## 2. Develop (structured output + few-shot)
**Prompt:** "Define services as {id, n, m (minutes), p (price)} and staff as {id, n, days[]}. Example: {1,'Classic Haircut',30,25}. Write a function free(staff, date, start, duration) that returns true only if the whole duration is open. Return index.html, styles.css and app.js separately."
**Technique:** few-shot example, function-level specification, task decomposition.

## 3. Evaluate (rubric + edge-case prompt)
**Prompt:** "Score the code 1-5 on each item and list fixes: (a) double booking and overlapping durations, (b) closed days and past times, (c) 'Any available' barber assignment, (d) reschedule keeps the same booking, (e) form validation, (f) responsive at 360/768/1200px, (g) keyboard use and safe handling of typed text."

| Criterion | Score | Finding |
|---|---|---|
| Availability logic | 4 | Reschedule must ignore the booking being moved |
| Edge cases | 4 | Time can be taken between selecting and confirming |
| Validation | 4 | Phone needed a clear format message |
| Responsive | 5 | Summary stacks below the steps on phones |
| Accessibility | 4 | Step list and selected options needed aria states |

## 4. Improve (iterative refinement)
**Prompt:** "Fix the findings above. Keep existing behavior. Show only changed code."
Changes: reschedule flow that excludes its own booking, a final availability re-check on submit, form values kept when going back, aria-pressed on all choice buttons.
**Next iteration ideas:** add a month calendar view, send an "Add to calendar" file, add an admin day view of all bookings.

## Run it
Open `index.html` in a browser (internet needed for the Bootstrap and font CDNs).
