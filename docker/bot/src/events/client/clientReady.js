const { ActivityType } = require('discord.js');

module.exports = {
    name: 'clientReady',
    once: false,
    execute: async (client, connection) => {
        console.log('[API] '.bold.green + `Connected to Discord.`.bold.white);

        // user can custom Activities
        const keys = [
            `+${client.users.cache.size} membres`,
        ];

        let i = 0;
        setInterval(() => {
            if (i >= keys.length) i = 0;
            client.user.setActivity(keys[i], { type: ActivityType.Watching });
            i++;
        }, 10 * 1000);

    }
}