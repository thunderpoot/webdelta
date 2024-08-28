# Δδ

## webdelta.js

https://thunderpoot.github.io/webdelta/

`webdelta.js` is a versatile JavaScript utility that allows you to easily convert UNIX timestamps into human-readable dates, times, and relative time descriptions directly on your webpages. This script dynamically displays time information with customisable tooltips and formats.

### Features

- **Automatic Conversion**: Converts UNIX timestamps to readable date and time formats.
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
<script src="https://cdn.jsdelivr.net/gh/thunderpoot/webdelta@1.0.2/dist/webdelta.min.js"></script>
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

### Available Options

| Class       | Description                                                    |
|-------------|----------------------------------------------------------------|
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
        tooltipBackgroundColor: '#333333',
        tooltipForegroundColor: '#ffcc00'
    };
</script>
```

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Author

T E Vaughan

### Links

- [GitHub Repository](https://github.com/thunderpoot/webdelta)
- [Issue Tracker](https://github.com/thunderpoot/webdelta/issues)
