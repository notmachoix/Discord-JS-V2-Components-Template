const { colorize } = require('../utils/consoleStyle');
const { name, version } = require('../../package.json');
const config = require('../config/config.json');

const title = ` ${config.botName || name} `;
const subtitle = ` v${version} — Discord.js Bot Template `;

const width = Math.max(title.length, subtitle.length) + 4;
const pad = (text) => {
    const totalPad = width - text.length;
    const left = Math.floor(totalPad / 2);
    const right = totalPad - left;
    return `${' '.repeat(left)}${text}${' '.repeat(right)}`;
};

const lines = [
    `╔${'═'.repeat(width)}╗`,
    `║${pad(title)}║`,
    `║${pad(subtitle)}║`,
    `╚${'═'.repeat(width)}╝`,
];

const colors = ['cyan', 'magenta', 'green', 'yellow'];

lines.forEach((line, i) => {
    console.log(colorize(colors[i % colors.length], line));
});
