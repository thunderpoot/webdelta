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
    tooltipBorderRadius: '0',
    tooltipFont: 'Menlo, monospaced',
    tooltipXOffset: 15,
    tooltipYOffset: 15,
    timeZone: 'UTC',
    lang: 'eng',
    tooltipBackgroundColor: 'black',
    tooltipForegroundColor: 'white'
};

document.addEventListener("DOMContentLoaded", function () {
    const elements = document.querySelectorAll('span.webDelta');

    elements.forEach(element => {
        const timestamp = parseInt(element.textContent.trim());
        if (isNaN(timestamp)) {
            console.error(`Invalid timestamp: ${element.textContent.trim()}`);
            element.textContent = "Invalid timestamp";
            return;
        }

        const date = new Date(timestamp * 1000);
        const useUTC = element.classList.contains('utc');
        const timeZone = useUTC ? 'UTC' : (window.webDeltaConfig.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone);

        let options = { timeZone: timeZone };

        let formattedDate = '';

        if (element.classList.contains('timeOnly')) {
            options = {
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric',
                ...options
            };
            if (element.classList.contains('weekday')) {
                const weekdayOptions = { weekday: 'long', timeZone: timeZone };
                const weekdayStr = date.toLocaleDateString(undefined, weekdayOptions);
                const timeStr = date.toLocaleTimeString(undefined, options);
                formattedDate = `${weekdayStr}, ${timeStr}`;
            } else {
                formattedDate = date.toLocaleTimeString(undefined, options);
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
            formattedDate = date.toLocaleDateString(undefined, options);
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
            formattedDate = date.toLocaleString(undefined, options);
        }

        // Add time zone information if not using noTZ class and timezone is not already included
        if (!element.classList.contains('noTZ') && !element.classList.contains('iso8601') && !formattedDate.includes(timeZone)) {
            formattedDate += ` ${timeZone}`;
        }

        // Update the element's content with the formatted date and time
        element.textContent = formattedDate;

        // Skip tooltip creation if noTooltip class is present
        if (element.classList.contains('noTooltip')) {
            return;
        }

        // Ensure no existing tooltip is present before creating a new one
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
            const seconds = Math.floor(absDiff / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            const days = Math.floor(hours / 24);
            const years = Math.floor(days / 365.25);
            const remainingDays = days % 365.25;
            const remainingHours = hours % 24;
            const remainingMinutes = minutes % 60;
            const remainingSeconds = seconds % 60;

            let timeAgo = '';

            if (element.classList.contains('deltaLonger')) {
                const parts = [];
                if (years > 0) parts.push(`${years} year${years > 1 ? 's' : ''}`);
                if (Math.floor(remainingDays) > 0) parts.push(`${Math.floor(remainingDays)} day${Math.floor(remainingDays) > 1 ? 's' : ''}`);
                if (remainingHours > 0) parts.push(`${remainingHours} hour${remainingHours > 1 ? 's' : ''}`);
                if (remainingMinutes > 0) parts.push(`${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`);
                if (remainingSeconds > 0) parts.push(`${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`);
                timeAgo = parts.join(', ');
            } else if (element.classList.contains('deltaLong')) {
                if (years > 0) {
                    timeAgo = `${years} year${years > 1 ? 's' : ''}`;
                } else if (days > 0) {
                    timeAgo = `${days} day${days > 1 ? 's' : ''}`;
                } else if (hours > 0) {
                    timeAgo = `${hours} hour${hours > 1 ? 's' : ''}`;
                } else if (minutes > 0) {
                    timeAgo = `${minutes} minute${minutes > 1 ? 's' : ''}`;
                } else if (seconds > 0) {
                    timeAgo = `${seconds} second${seconds > 1 ? 's' : ''}`;
                }
            } else {
                if (years > 0) {
                    timeAgo = `${years}y`;
                } else if (days > 0) {
                    timeAgo = `${days}d`;
                } else if (hours > 0) {
                    timeAgo = `${hours}h`;
                } else if (minutes > 0) {
                    timeAgo = `${minutes}m`;
                } else {
                    timeAgo = `${seconds}s`;
                }
            }

            timeAgo = timeDiff >= 0 ? `in ${timeAgo}` : `${timeAgo} ago`;

            tooltip.textContent = timeAgo;
        };

        const startInterval = () => {
            updateTooltip();
            setInterval(updateTooltip, 1000);
        };

        // Calculate delay to the next second
        const now = new Date();
        const delay = 1000 - now.getMilliseconds();

        // Start the interval at the beginning of the next second
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
