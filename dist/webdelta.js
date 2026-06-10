window.webDeltaConfig = {
  tooltipBorderRadius: "5px",
  tooltipFont: "Menlo, monospaced",
  tooltipFontSize: "15px",
  tooltipXOffset: 15,
  tooltipYOffset: 15,
  // No timeZone default: when unset, times render in the browser's local
  // time zone via Intl.DateTimeFormat().resolvedOptions().timeZone (see below).
  // Set window.webDeltaConfig.timeZone to force a specific zone.
  lang: "en",
  // Supports BCP47 values such as sv-SE or en-GB
  tooltipBackgroundColor: "black",
  tooltipForegroundColor: "white"
};
const webDeltaState = /* @__PURE__ */ new WeakMap();
document.addEventListener("DOMContentLoaded", function() {
  const elements = document.querySelectorAll("span.webDelta");
  elements.forEach((element) => {
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
    const rawValue = element.textContent.trim();
    const isAoe = element.classList.contains("aoe");
    const isEpoch = /^[+-]?\d+$/.test(rawValue);
    const zoneRe = /(Z|[+-]\d{2}:?\d{2})$/i;
    let date;
    if (isEpoch && !isAoe) {
      date = new Date(parseInt(rawValue, 10) * 1e3);
    } else if (isAoe) {
      let iso = rawValue;
      if (zoneRe.test(iso)) {
        console.warn(`webDelta: 'aoe' overrides the explicit zone in "${rawValue}"`);
        iso = iso.replace(zoneRe, "");
      }
      if (!/T/.test(iso)) {
        iso += "T23:59:59";
      } else if (/T\d{2}:\d{2}$/.test(iso)) {
        iso += ":59";
      }
      date = /* @__PURE__ */ new Date(`${iso}-12:00`);
    } else if (zoneRe.test(rawValue)) {
      date = new Date(rawValue);
    } else {
      console.error(`webDelta: wall-clock "${rawValue}" has no time zone; add an offset (e.g. +01:00) or the 'aoe' class`);
      element.textContent = "Invalid time (no time zone)";
      return;
    }
    const useUTC = element.classList.contains("utc");
    const timeZone = useUTC ? "UTC" : window.webDeltaConfig.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const locale = window.webDeltaConfig.lang || void 0;
    const numeric = window.webDeltaConfig.numeric || "auto";
    let options = { timeZone };
    let formattedDate = "";
    if (isNaN(date.getTime())) {
      console.error(`Invalid timestamp: ${rawValue}`);
      element.textContent = "Invalid timestamp";
      return;
    }
    if (element.classList.contains("raw")) {
      formattedDate = rawValue;
    } else {
      if (element.classList.contains("timeOnly")) {
        options = {
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
          ...options
        };
        if (element.classList.contains("weekday")) {
          const weekdayOptions = { weekday: "long", timeZone };
          const weekdayStr = date.toLocaleDateString(locale, weekdayOptions);
          const timeStr = date.toLocaleTimeString(locale, options);
          formattedDate = `${weekdayStr}, ${timeStr}`;
        } else {
          formattedDate = date.toLocaleTimeString(locale, options);
        }
      } else if (element.classList.contains("dateOnly")) {
        options = {
          year: "numeric",
          month: "long",
          day: "numeric",
          ...options
        };
        if (element.classList.contains("weekday")) {
          options.weekday = "long";
        }
        formattedDate = date.toLocaleDateString(locale, options);
      } else if (element.classList.contains("iso8601")) {
        formattedDate = date.toISOString();
      } else {
        if (element.classList.contains("short")) {
          options = { ...options, dateStyle: "short", timeStyle: "short" };
        } else if (element.classList.contains("medium")) {
          options = { ...options, dateStyle: "medium", timeStyle: "medium" };
        } else if (element.classList.contains("long")) {
          options = { ...options, dateStyle: "long", timeStyle: "long" };
        } else if (element.classList.contains("full")) {
          options = { ...options, dateStyle: "full", timeStyle: "long" };
        } else {
          options = {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
            ...options
          };
        }
        if (element.classList.contains("weekday") && !element.classList.contains("short")) {
          options.weekday = "long";
        }
        formattedDate = date.toLocaleString(locale, options);
      }
      if (!element.classList.contains("noTZ") && !element.classList.contains("iso8601") && !formattedDate.includes(timeZone)) {
        formattedDate += ` ${timeZone}`;
      }
    }
    const swap = element.classList.contains("swap");
    const formatDelta = () => {
      const now = /* @__PURE__ */ new Date();
      const timeDiff = date - now;
      const absDiff = Math.abs(timeDiff);
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric });
      const SECOND = 1e3;
      const MINUTE = 60 * SECOND;
      const HOUR = 60 * MINUTE;
      const DAY = 24 * HOUR;
      const WEEK = 7 * DAY;
      const MONTH = 30.4375 * DAY;
      const YEAR = 365.25 * DAY;
      let divisor, unit;
      if (absDiff >= 11.5 * MONTH) {
        divisor = YEAR;
        unit = "year";
      } else if (absDiff >= MONTH) {
        divisor = MONTH;
        unit = "month";
      } else if (absDiff >= 6.5 * DAY) {
        divisor = WEEK;
        unit = "week";
      } else if (absDiff >= 23.5 * HOUR) {
        divisor = DAY;
        unit = "day";
      } else if (absDiff >= 59.5 * MINUTE) {
        divisor = HOUR;
        unit = "hour";
      } else if (absDiff >= 59.5 * SECOND) {
        divisor = MINUTE;
        unit = "minute";
      } else {
        divisor = SECOND;
        unit = "second";
      }
      return rtf.format(Math.round(timeDiff / divisor), unit);
    };
    element.textContent = swap ? formatDelta() : formattedDate;
    const hasTooltip = !element.classList.contains("noTooltip");
    let tooltip = null;
    if (hasTooltip) {
      tooltip = document.createElement("span");
      tooltip.className = "webDelta-tooltip";
      tooltip.style.position = "absolute";
      tooltip.style.padding = "8px";
      tooltip.style.backgroundColor = window.webDeltaConfig.tooltipBackgroundColor || "black";
      tooltip.style.color = window.webDeltaConfig.tooltipForegroundColor || "white";
      tooltip.style.borderRadius = window.webDeltaConfig.tooltipBorderRadius || "5px";
      tooltip.style.fontFamily = window.webDeltaConfig.tooltipFont || "Arial, sans-serif";
      tooltip.style.fontSize = window.webDeltaConfig.tooltipFontSize || "15px";
      tooltip.style.whiteSpace = "nowrap";
      tooltip.style.visibility = "hidden";
      tooltip.style.opacity = "0";
      tooltip.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      tooltip.style.pointerEvents = "none";
      tooltip.style.transform = "scale(0.8)";
      tooltip.style.zIndex = "1000";
      if (swap) {
        tooltip.textContent = formattedDate;
      }
      document.body.appendChild(tooltip);
      state.tooltip = tooltip;
      element.addEventListener("mouseover", () => {
        tooltip.style.visibility = "visible";
        tooltip.style.opacity = "1";
        tooltip.style.transform = "scale(1)";
      });
      element.addEventListener("mousemove", (e) => {
        const scrollY = window.scrollY || window.pageYOffset;
        const scrollX = window.scrollX || window.pageXOffset;
        tooltip.style.top = `${e.clientY + scrollY + (window.webDeltaConfig.tooltipYOffset || 15)}px`;
        tooltip.style.left = `${e.clientX + scrollX + (window.webDeltaConfig.tooltipXOffset || 15)}px`;
      });
      element.addEventListener("mouseout", () => {
        tooltip.style.opacity = "0";
        tooltip.style.visibility = "hidden";
        tooltip.style.transform = "scale(0.8)";
      });
    }
    const liveTarget = swap ? element : tooltip;
    if (liveTarget) {
      const updateDelta = () => {
        liveTarget.textContent = formatDelta();
      };
      const startInterval = () => {
        updateDelta();
        state.intervalId = setInterval(updateDelta, 1e3);
      };
      const now = /* @__PURE__ */ new Date();
      const delay = 1e3 - now.getMilliseconds();
      state.timeoutId = setTimeout(startInterval, delay);
    }
  });
});
