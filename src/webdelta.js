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
    tooltipXOffset: 15,
    tooltipYOffset: 15,
    timeZone: 'UTC',
    lang: 'en', // Supports BCP47 values such as sv-SE or en-GB
    tooltipBackgroundColor: 'black',
    tooltipForegroundColor: 'white'
};

document.addEventListener("DOMContentLoaded", function () {
    const elements = document.querySelectorAll('span.webDelta');

    elements.forEach(element => {
        const timestamp = parseInt(element.textContent.trim());
        const date = new Date(timestamp * 1000);
        const useUTC = element.classList.contains('utc');
        const timeZone = useUTC ? 'UTC' : (window.webDeltaConfig.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);
        const locale = window.webDeltaConfig.lang || undefined;
        let options = { timeZone: timeZone };

        let formattedDate = '';

        if (element.classList.contains('raw')) {
            formattedDate = timestamp;
        }
        else {
            if (isNaN(timestamp)) {
                console.error(`Invalid timestamp: ${element.textContent.trim()}`);
                element.textContent = "Invalid timestamp";
                return;
            }

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

        element.textContent = formattedDate;

        if (element.classList.contains('noTooltip')) {
            return;
        }

        if (element.nextElementSibling && element.nextElementSibling.classList.contains('webDelta-tooltip')) {
            element.nextElementSibling.remove();
        }

        const tooltip = document.createElement('span');
        tooltip.className = 'webDelta-tooltip';
        tooltip.style.position = 'absolute';
        tooltip.style.padding = '8px';
        tooltip.style.backgroundColor = window.webDeltaConfig.tooltipBackgroundColor || 'black';
        tooltip.style.color = window.webDeltaConfig.tooltipForegroundColor || 'white';
        tooltip.style.borderRadius = window.webDeltaConfig.tooltipBorderRadius || '5px';
        tooltip.style.fontFamily = window.webDeltaConfig.tooltipFont || 'Arial, sans-serif';
        tooltip.style.whiteSpace = 'nowrap';
        tooltip.style.visibility = 'hidden';
        tooltip.style.opacity = '0';
        tooltip.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        tooltip.style.pointerEvents = 'none';
        tooltip.style.transform = 'scale(0.8)';
        tooltip.style.zIndex = '1000';

        document.body.appendChild(tooltip);

        const updateTooltip = () => {
            const now = new Date();
            const timeDiff = date - now;
            const absDiff = Math.abs(timeDiff);

            const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

            let timeAgo = '';

            if (absDiff >= 31536000000) { // years
                const years = Math.floor(timeDiff / 31536000000);
                timeAgo = rtf.format(years, 'year');
            } else if (absDiff >= 86400000) { // days
                const days = Math.floor(timeDiff / 86400000);
                timeAgo = rtf.format(days, 'day');
            } else if (absDiff >= 3600000) { // hours
                const hours = Math.floor(timeDiff / 3600000);
                timeAgo = rtf.format(hours, 'hour');
            } else if (absDiff >= 60000) { // minutes
                const minutes = Math.floor(timeDiff / 60000);
                timeAgo = rtf.format(minutes, 'minute');
            } else { // seconds
                const seconds = Math.floor(timeDiff / 1000);
                timeAgo = rtf.format(seconds, 'second');
            }

            tooltip.textContent = timeAgo;
        };

        const startInterval = () => {
            updateTooltip();
            setInterval(updateTooltip, 1000);
        };

        const now = new Date();
        const delay = 1000 - now.getMilliseconds();

        setTimeout(startInterval, delay);

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
    });
});
