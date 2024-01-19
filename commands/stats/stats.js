const {
    SlashCommandBuilder,
    EmbedBuilder
} = require('discord.js');

// node-os-utils
const osu = require('node-os-utils')
const axios = require('axios')
const mem = osu.mem
const drive = osu.drive
const cpu = osu.cpu
const os = osu.os

const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        // Command info
        .setName(config.node.command)
        .setDescription('Node statistics for ' + config.node.name),

    async execute(interaction) {
        try {
            mem.info().then(async Ram => {
                drive.info().then(async Disk => {
                    cpu.usage().then(async Cpu => {
                        const ipInfoResponse = await axios.get('https://ipinfo.io/json');
                        const ipLocation = ipInfoResponse.data.city + ', ' + ipInfoResponse.data.region + ', ' + ipInfoResponse.data.country;
                        const ipAddress = ipInfoResponse.data.ip;
                        const ipProvider = ipInfoResponse.data.org;
                        const usedMemoryPercent = ((Ram.usedMemMb / Ram.totalMemMb) * 100).toFixed(2);
                        const usedDiskPercent = ((Disk.usedGb / Disk.totalGb) * 100).toFixed(2);

                        let time = os.uptime();
                        let hours = secondsToHms(time);

                        let status = ":green_circle: Operational";

                        if (Cpu > 90) {
                            status = ':warning: CPU is overloaded';
                        }

                        if (usedMemoryPercent > 80) {
                            status = ':warning: RAM is overloaded';
                        }

                        const statsEmbed = new EmbedBuilder()
                            .setColor(config.embed.color)
                            .setTitle(config.embed.title)
                            .setThumbnail(config.embed.logo)
                            .addFields({
                                name: 'Status',
                                value: status
                            }, {
                                name: 'Provider',
                                value: ipProvider
                            }, {
                                name: 'IPv4 Address',
                                value: ipAddress
                            }, {
                                name: 'Hostname',
                                value: config.node.hostname
                            }, {
                                name: 'Location',
                                value: ipLocation
                            }, {
                                name: 'RAM Usage',
                                value: `${(Ram.usedMemMb / 1000).toFixed(2)} GiB of ${(Ram.totalMemMb / 1000).toFixed(2)} GiB (${usedMemoryPercent}%)`
                            }, {
                                name: 'CPU Usage',
                                value: `${Cpu}%`
                            }, {
                                name: 'CPU Model',
                                value: `${cpu.model()}`
                            }, {
                                name: 'CPU Information',
                                value: `${cpu.count()/2} cores, ${cpu.count()} threads`
                            }, {
                                name: 'Disk Usage',
                                value: `${Disk.usedGb} GiB of ${Disk.totalGb} GiB (${usedDiskPercent}%)`
                            }, {
                                name: 'Uptime',
                                value: `${hours}`
                            }, )
                        await interaction.reply({
                            embeds: [statsEmbed]
                        });
                    })
                })
            })
        } catch (error) {
            await interaction.reply(`Error: ${error.message}`);
        }
    },
};

function secondsToHms(seconds) {
    if (!seconds) return '';
    let duration = seconds;
    let hours = duration / 3600;
    duration = duration % (3600);

    let min = parseInt(duration / 60);
    duration = duration % (60);
    let sec = parseInt(duration);

    if (sec < 10) {
        sec = `0${sec}`;
    }
    if (min < 10) {
        min = `0${min}`;
    }
    if (parseInt(hours, 10) > 0) {
        return `${parseInt(hours, 10)}h ${min}m ${sec}s`
    } else if (min == 0) {
        return `${sec}s`
    } else {
        return `${min}m ${sec}s`
    }
}
