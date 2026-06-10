// ......:::...........-#@@@@*-..
// .....:@@@@........=@@@*--*@#..
// .....@@*@@=.......%@@.........
// ....-@@.=@@:.......#@@@@@@*:..
// ...:@@+..@@*......#@@=...#@@+.
// ...+@@...-@@:....=@@......+@@:
// ..:@@=....@@%....#@@.......@@+
// ..%@@.....-@@=...#@@.......@@+
// .-@@=......@@@...=@@:.....+@@:
// .@@@=======+@@+...#@@=...#@@+.
// =@@@@@@@@@@@@@@:...:#@@@@@*:..

// ===========
// webdelta.js
// ===========
// Date:          2024-08-27T01:14:28.000Z
// Author Name:   T E Vaughan
// Author Email:  underwood@underwood.network
// URL:           https://github.com/thunderpoot/webdelta


window.webDeltaConfig = {
    tooltipBorderRadius: '5px',
    tooltipFont: 'Menlo, monospaced',
    tooltipFontSize: '15px',
    tooltipXOffset: 15,
    tooltipYOffset: 15,
    // No timeZone default: when unset, times render in the browser's local
    // time zone via Intl.DateTimeFormat().resolvedOptions().timeZone (see below).
    // Set window.webDeltaConfig.timeZone to force a specific zone.
    lang: 'en', // Supports BCP47 values such as sv-SE or en-GB
    tooltipBackgroundColor: 'black',
    tooltipForegroundColor: 'white'
};

// Per-element state (live-update timers and the created tooltip), kept at module
// scope so it survives repeat runs. Re-running the formatter on the same element
// (e.g. when an embedding page re-renders after the timestamp changes) must clear
// the previous run's timers, otherwise stacked intervals fight over the element
// and the text flickers between values.
const webDeltaState = new WeakMap();

document.addEventListener("DOMContentLoaded", function () {
    const elements = document.querySelectorAll('span.webDelta');

    elements.forEach(element => {
        // Tear down anything left over from a previous run on this element.
        const previousState = webDeltaState.get(element);
        if (previousState) {
            clearTimeout(previousState.timeoutId);
            clearInterval(previousState.intervalId);
            if (previousState.tooltip) {
                previousState.tooltip.remove();
            }
        }
        const state = {};
        webDeltaState.set(element, state);

        // Resolve the element's contents to an absolute instant. Two input
        // families are accepted:
        //
        //   1. UNIX epoch seconds: an optional-sign run of digits. This is the
        //      original, unambiguous input and remains the default.
        //   2. ISO 8601 wall-clock: a date/time string. A wall-clock has no
        //      meaning until we know *which* zone it is in, and the conversion
        //      to the viewer's local time is the whole point of the library, so
        //      the source zone must be explicit. It can be supplied two ways:
        //        - an offset baked into the string (e.g. ...T23:59:00+01:00),
        //          which Date parses natively, or
        //        - the `aoe` class, a preset for "Anywhere on Earth" (UTC-12),
        //          the standard for conference / CFP deadlines.
        //      A bare wall-clock with neither is rejected rather than silently
        //      assumed to be the viewer's local time, which would misconvert a
        //      deadline an organiser published in their own zone.
        const rawValue = element.textContent.trim();
        const isAoe = element.classList.contains('aoe');
        const isEpoch = /^[+-]?\d+$/.test(rawValue);
        // Matches a trailing zone designator: Z, or ±HH:MM / ±HHMM.
        const zoneRe = /(Z|[+-]\d{2}:?\d{2})$/i;

        let date;
        if (isEpoch && !isAoe) {
            date = new Date(parseInt(rawValue, 10) * 1000);
        } else if (isAoe) {
            // Pin the wall-clock to UTC-12. Strip any zone the author included
            // (it is meaningless alongside aoe) and warn if so.
            let iso = rawValue;
            if (zoneRe.test(iso)) {
                console.warn(`webDelta: 'aoe' overrides the explicit zone in "${rawValue}"`);
                iso = iso.replace(zoneRe, '');
            }
            // Conference deadlines are quoted to the end of the stated
            // precision: "...T23:59" means 23:59:59, and a bare date means the
            // end of that day. Default the missing components accordingly so a
            // deadline is never silently moved earlier.
            if (!/T/.test(iso)) {
                iso += 'T23:59:59';
            } else if (/T\d{2}:\d{2}$/.test(iso)) {
                iso += ':59';
            }
            date = new Date(`${iso}-12:00`);
        } else if (zoneRe.test(rawValue)) {
            // Wall-clock with an explicit offset: parse as the absolute instant.
            date = new Date(rawValue);
        } else {
            console.error(`webDelta: wall-clock "${rawValue}" has no time zone; add an offset (e.g. +01:00) or the 'aoe' class`);
            element.textContent = "Invalid time (no time zone)";
            return;
        }

        const useUTC = element.classList.contains('utc');
        const timeZone = useUTC ? 'UTC' : (window.webDeltaConfig.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);
        const locale = window.webDeltaConfig.lang || undefined;
        // Controls relative-time wording: 'auto' renders ±1 of a unit as words
        // ("tomorrow", "last week"), 'always' keeps it numeric ("in 1 day").
        const numeric = window.webDeltaConfig.numeric || 'auto';
        let options = { timeZone: timeZone };

        let formattedDate = '';

        if (isNaN(date.getTime())) {
            console.error(`Invalid timestamp: ${rawValue}`);
            element.textContent = "Invalid timestamp";
            return;
        }

        if (element.classList.contains('raw')) {
            // Preserve exactly what the author wrote (epoch or wall-clock).
            formattedDate = rawValue;
        }
        else {
            if (element.classList.contains('timeOnly')) {
                options = {
                    hour: 'numeric',
                    minute: 'numeric',
                    second: 'numeric',
                    ...options
                };
                if (element.classList.contains('weekday')) {
                    const weekdayOptions = { weekday: 'long', timeZone: timeZone };
                    const weekdayStr = date.toLocaleDateString(locale, weekdayOptions);
                    const timeStr = date.toLocaleTimeString(locale, options);
                    formattedDate = `${weekdayStr}, ${timeStr}`;
                } else {
                    formattedDate = date.toLocaleTimeString(locale, options);
                }
            } else if (element.classList.contains('dateOnly')) {
                options = {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    ...options
                };
                if (element.classList.contains('weekday')) {
                    options.weekday = 'long';
                }
                formattedDate = date.toLocaleDateString(locale, options);
            } else if (element.classList.contains('iso8601')) {
                formattedDate = date.toISOString();
            } else {
                if (element.classList.contains('short')) {
                    options = { ...options, dateStyle: 'short', timeStyle: 'short' };
                } else if (element.classList.contains('medium')) {
                    options = { ...options, dateStyle: 'medium', timeStyle: 'medium' };
                } else if (element.classList.contains('long')) {
                    options = { ...options, dateStyle: 'long', timeStyle: 'long' };
                } else if (element.classList.contains('full')) {
                    options = { ...options, dateStyle: 'full', timeStyle: 'long' };
                } else {
                    // Default format (equivalent to 'long')
                    options = {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        ...options
                    };
                }
                if (element.classList.contains('weekday') && !element.classList.contains('short')) {
                    options.weekday = 'long';
                }
                formattedDate = date.toLocaleString(locale, options);
            }

            // Add time zone information if not using noTZ class and timezone is not already included
            if (!element.classList.contains('noTZ') && !element.classList.contains('iso8601') && !formattedDate.includes(timeZone)) {
                formattedDate += ` ${timeZone}`;
            }
        }

        // The 'swap' class inverts the two pieces of information: the live relative
        // delta is shown inline, and the static formatted date moves into the tooltip.
        const swap = element.classList.contains('swap');

        // Compute the relative-time ("delta") string for the current moment.
        const formatDelta = () => {
            const now = new Date();
            const timeDiff = date - now;       // ms; negative = past, positive = future
            const absDiff = Math.abs(timeDiff);

            const rtf = new Intl.RelativeTimeFormat(locale, { numeric: numeric });

            // Unit lengths in milliseconds. Month and year use average lengths so
            // long spans don't drift against uneven months and leap years.
            const SECOND = 1000;
            const MINUTE = 60 * SECOND;
            const HOUR = 60 * MINUTE;
            const DAY = 24 * HOUR;
            const WEEK = 7 * DAY;
            const MONTH = 30.4375 * DAY;  // 365.25 / 12
            const YEAR = 365.25 * DAY;

            // Choose the unit by magnitude, then round to the nearest whole unit
            // (symmetric for past and future). Each threshold sits at the midpoint
            // where rounding would tip into the next unit (e.g. 59.5 minutes), so
            // the result never reads "60 minutes" or "24 hours".
            let divisor, unit;
            if (absDiff >= 11.5 * MONTH) { divisor = YEAR; unit = 'year'; }
            else if (absDiff >= MONTH) { divisor = MONTH; unit = 'month'; }
            else if (absDiff >= 6.5 * DAY) { divisor = WEEK; unit = 'week'; }
            else if (absDiff >= 23.5 * HOUR) { divisor = DAY; unit = 'day'; }
            else if (absDiff >= 59.5 * MINUTE) { divisor = HOUR; unit = 'hour'; }
            else if (absDiff >= 59.5 * SECOND) { divisor = MINUTE; unit = 'minute'; }
            else { divisor = SECOND; unit = 'second'; }

            return rtf.format(Math.round(timeDiff / divisor), unit);
        };

        // Inline text: live delta when swapped, otherwise the formatted date.
        element.textContent = swap ? formatDelta() : formattedDate;

        const hasTooltip = !element.classList.contains('noTooltip');
        let tooltip = null;

        if (hasTooltip) {
            tooltip = document.createElement('span');
            tooltip.className = 'webDelta-tooltip';
            tooltip.style.position = 'absolute';
            tooltip.style.padding = '8px';
            tooltip.style.backgroundColor = window.webDeltaConfig.tooltipBackgroundColor || 'black';
            tooltip.style.color = window.webDeltaConfig.tooltipForegroundColor || 'white';
            tooltip.style.borderRadius = window.webDeltaConfig.tooltipBorderRadius || '5px';
            tooltip.style.fontFamily = window.webDeltaConfig.tooltipFont || 'Arial, sans-serif';
            tooltip.style.fontSize = window.webDeltaConfig.tooltipFontSize || '15px';
            tooltip.style.whiteSpace = 'nowrap';
            tooltip.style.visibility = 'hidden';
            tooltip.style.opacity = '0';
            tooltip.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            tooltip.style.pointerEvents = 'none';
            tooltip.style.transform = 'scale(0.8)';
            tooltip.style.zIndex = '1000';

            // When swapped, the tooltip shows the static formatted date.
            if (swap) {
                tooltip.textContent = formattedDate;
            }

            document.body.appendChild(tooltip);
            state.tooltip = tooltip;

            element.addEventListener('mouseover', () => {
                tooltip.style.visibility = 'visible';
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'scale(1)';
            });

            element.addEventListener('mousemove', (e) => {
                const scrollY = window.scrollY || window.pageYOffset;
                const scrollX = window.scrollX || window.pageXOffset;
                tooltip.style.top = `${e.clientY + scrollY + (window.webDeltaConfig.tooltipYOffset || 15)}px`;
                tooltip.style.left = `${e.clientX + scrollX + (window.webDeltaConfig.tooltipXOffset || 15)}px`;
            });

            element.addEventListener('mouseout', () => {
                tooltip.style.opacity = '0';
                tooltip.style.visibility = 'hidden';
                tooltip.style.transform = 'scale(0.8)';
            });
        }

        // The live delta updates every second. It targets the inline element when
        // swapped, otherwise the tooltip. When not swapped and there is no tooltip,
        // nothing needs live updating.
        const liveTarget = swap ? element : tooltip;

        if (liveTarget) {
            const updateDelta = () => {
                liveTarget.textContent = formatDelta();
            };

            const startInterval = () => {
                updateDelta();
                state.intervalId = setInterval(updateDelta, 1000);
            };

            const now = new Date();
            const delay = 1000 - now.getMilliseconds();

            state.timeoutId = setTimeout(startInterval, delay);
        }
    });
});
