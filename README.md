# Δδ

## webdelta.js

https://thunderpoot.github.io/webdelta/

`webdelta.js` is a versatile JavaScript utility that allows you to easily convert UNIX timestamps **and ISO 8601 date/time strings** into human-readable dates, times, and relative time descriptions directly on your webpages. This script dynamically displays time information with customisable tooltips and formats.

As well as UNIX timestamps, you can give an element an ISO 8601 wall-clock string. This is handy when you want to write a human-readable time rather than an epoch number, and it powers the `aoe` class for "Anywhere on Earth" conference and CFP deadlines. See [Input formats](#input-formats) below.

### Features

- **Flexible Input**: Accepts UNIX timestamps or ISO 8601 wall-clock strings, including an `aoe` ("Anywhere on Earth", UTC&minus;12) mode for conference deadlines.
- **Automatic Conversion**: Converts UNIX timestamps and ISO 8601 strings to readable date and time formats.
- **Time Zone Support**: Automatically displays times in the user's local time zone or a custom time zone of your choice.
- **Localised**: Makes use of the JavaScript Intl API to support [multiple locales](https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry).
- **Relative Time Descriptions**: Displays relative time (e.g., "2 minutes ago" or "in 3 days") with live updating tooltips.
- **Custom Formatting**: Choose from various formatting options like `short`, `medium`, `long`, and `full` for dates and times.
- **Tooltip Customisation**: Fully customisable tooltips with adjustable styles and behaviours, including support for dynamic updates every second.
- **Synchronisation**: Ensures that all time updates are perfectly synchronised with the real-time clock.
- **Easy Integration**: Just include the script on your webpage and add the appropriate classes to your tags.
- **Multiple Display Modes**: Display only the date, only the time, or both, with or without time zones.

### Installation

#### CDN:

Include the script in your HTML:

```html
<script src="https://cdn.jsdelivr.net/gh/thunderpoot/webdelta@1.2.0/dist/webdelta.min.js"></script>
```

#### Download:

1. Download the `webdelta.js` file and include it in your project.
2. Add the following line in your HTML:

```html
<script src="path/to/webdelta.js"></script>
```

### Usage

1. Add the `webDelta` class to any `<span>` element containing a UNIX timestamp:

```html
<span class="webDelta">1724769141</span>
```

2. Customise the display using additional classes:

```html
<span class="webDelta dateOnly weekday">1724769141</span>
```

### Input formats

An element's contents can be **either** a UNIX timestamp **or** an ISO 8601 date/time string. The script detects which you have given it:

**UNIX timestamp** — a plain integer (seconds since the epoch). This is unambiguous and needs no time zone:

```html
<span class="webDelta">1724769141</span>
```

**ISO 8601 wall-clock string** — a written date/time. A wall-clock has no meaning until the script knows *which* zone it is in, and converting it to the viewer's local time is the whole point, so the source zone must be explicit. You can supply it two ways:

```html
<!-- 1. An offset baked into the string (parsed as that exact instant) -->
<span class="webDelta">2026-06-09T23:59:00+01:00</span>

<!-- 2. The aoe class: interpret the time as Anywhere on Earth (UTC-12) -->
<span class="webDelta aoe">2026-06-09T23:59</span>
```

A bare wall-clock with no offset and no `aoe` class (e.g. `2026-06-09T23:59`) is **rejected** rather than silently assumed to be the viewer's local zone, which would misconvert a deadline an organiser published in their own zone.

#### Anywhere on Earth (`aoe`)

[Anywhere on Earth](https://en.wikipedia.org/wiki/Anywhere_on_Earth) (AoE) is UTC&minus;12 and is the standard way conferences and calls for papers quote submission deadlines: the deadline has not passed until it has passed everywhere on Earth. Add the `aoe` class to interpret a wall-clock string as AoE, and every visitor sees it converted to their own local time, with the usual live countdown:

```html
<span class="webDelta aoe swap">2026-06-09T23:59</span>
```

To avoid moving a deadline earlier, a missing component defaults to the **end** of the stated precision: `...T23:59` becomes `:59` seconds, and a bare date (e.g. `2026-09-15`) becomes the end of that day. AoE uses a fixed offset, so there is no daylight-saving ambiguity. (Named IANA zones with DST, e.g. `Europe/London`, are not yet supported; use an explicit offset in the meantime.)

### Available Options

| Class       | Description                                                    |
|-------------|----------------------------------------------------------------|
| `raw`       | Don't reformat the date, preserve the UNIX timestamp.          |
| `dateOnly`  | Display only the date (with time zone unless `noTZ` is present)|
| `timeOnly`  | Display only the time (with time zone unless `noTZ` is present)|
| `iso8601`   | Display the date and time in ISO 8601 format                   |
| `short`     | Display the date and time in a short format                    |
| `medium`    | Display the date and time in a medium format                   |
| `long`      | Display the date and time in a long format                     |
| `full`      | Display the date and time in a full format                     |
| `weekday`   | Include the full weekday name in the date and time string      |
| `utc`       | Force the date and time to be displayed in UTC                 |
| `noTZ`      | Disable the time zone display                                  |
| `noTooltip` | Disable the tooltip display                                    |
| `swap`      | Show the live relative delta inline and the date in the tooltip|
| `aoe`       | Interpret an ISO 8601 wall-clock string as Anywhere on Earth (UTC&minus;12). Missing components default to the end of the stated precision. See [Input formats](#input-formats). |

### Configuration

You can customise the behaviour and appearance of `webdelta.js` by adding the following configuration to your page:

```html
<script>
    window.webDeltaConfig = {
        tooltipBorderRadius: '8px',
        tooltipFont: 'Helvetica, sans-serif',
        tooltipFontSize: '16px',
        tooltipXOffset: 20,
        tooltipYOffset: 20,
        timeZone: 'Europe/Madrid',
        lang: 'es', // Supports BCP47 values such as sv-SE or en-GB
        numeric: 'auto', // 'auto' for "tomorrow"/"last week", 'always' for "in 1 day"
        tooltipBackgroundColor: '#333333',
        tooltipForegroundColor: '#ffcc00'
    };
</script>
```

All options are optional. In particular, `numeric` controls how relative deltas are worded: the default `'auto'` renders a difference of exactly one unit as a word (e.g. `tomorrow`, `yesterday`, `last week`), while `'always'` keeps it numeric (e.g. `in 1 day`, `1 day ago`).

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Author

T E Vaughan

### Links

- [GitHub Repository](https://github.com/thunderpoot/webdelta)
- [Issue Tracker](https://github.com/thunderpoot/webdelta/issues)
