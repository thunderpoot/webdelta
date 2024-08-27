window.webDeltaConfig = {
  tooltipBorderRadius: "5px",
  tooltipFont: "Menlo, monospaced",
  tooltipXOffset: 15,
  tooltipYOffset: 15,
  timeZone: "UTC",
  lang: "en",
  // Supports BCP47 values such as sv-SE or en-GB
  tooltipBackgroundColor: "black",
  tooltipForegroundColor: "white"
};
document.addEventListener("DOMContentLoaded", function() {
  const elements = document.querySelectorAll("span.webDelta");
  elements.forEach((element) => {
    const timestamp = parseInt(element.textContent.trim());
    if (isNaN(timestamp)) {
      console.error(`Invalid timestamp: ${element.textContent.trim()}`);
      element.textContent = "Invalid timestamp";
      return;
    }
    const date = new Date(timestamp * 1e3);
    const useUTC = element.classList.contains("utc");
    const timeZone = useUTC ? "UTC" : window.webDeltaConfig.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const locale = window.webDeltaConfig.lang || void 0;
    let options = { timeZone };
    let formattedDate = "";
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
    element.textContent = formattedDate;
    if (element.classList.contains("noTooltip")) {
      return;
    }
    if (element.nextElementSibling && element.nextElementSibling.classList.contains("webDelta-tooltip")) {
      element.nextElementSibling.remove();
    }
    const tooltip = document.createElement("span");
    tooltip.className = "webDelta-tooltip";
    tooltip.style.position = "absolute";
    tooltip.style.padding = "8px";
    tooltip.style.backgroundColor = window.webDeltaConfig.tooltipBackgroundColor || "black";
    tooltip.style.color = window.webDeltaConfig.tooltipForegroundColor || "white";
    tooltip.style.borderRadius = window.webDeltaConfig.tooltipBorderRadius || "5px";
    tooltip.style.fontFamily = window.webDeltaConfig.tooltipFont || "Arial, sans-serif";
    tooltip.style.whiteSpace = "nowrap";
    tooltip.style.visibility = "hidden";
    tooltip.style.opacity = "0";
    tooltip.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    tooltip.style.pointerEvents = "none";
    tooltip.style.transform = "scale(0.8)";
    tooltip.style.zIndex = "1000";
    document.body.appendChild(tooltip);
    const updateTooltip = () => {
      const now2 = /* @__PURE__ */ new Date();
      const timeDiff = date - now2;
      const absDiff = Math.abs(timeDiff);
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
      let timeAgo = "";
      if (absDiff >= 31536e6) {
        const years = Math.floor(timeDiff / 31536e6);
        timeAgo = rtf.format(years, "year");
      } else if (absDiff >= 864e5) {
        const days = Math.floor(timeDiff / 864e5);
        timeAgo = rtf.format(days, "day");
      } else if (absDiff >= 36e5) {
        const hours = Math.floor(timeDiff / 36e5);
        timeAgo = rtf.format(hours, "hour");
      } else if (absDiff >= 6e4) {
        const minutes = Math.floor(timeDiff / 6e4);
        timeAgo = rtf.format(minutes, "minute");
      } else {
        const seconds = Math.floor(timeDiff / 1e3);
        timeAgo = rtf.format(seconds, "second");
      }
      tooltip.textContent = timeAgo;
    };
    const startInterval = () => {
      updateTooltip();
      setInterval(updateTooltip, 1e3);
    };
    const now = /* @__PURE__ */ new Date();
    const delay = 1e3 - now.getMilliseconds();
    setTimeout(startInterval, delay);
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
  });
});
