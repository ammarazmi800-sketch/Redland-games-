const { 
    Client, 
    GatewayIntentBits, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ComponentType 
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const PREFIX = '+';
const userData = {};
const activeGames = {};

function getUser(userId) {
    if (!userData[userId]) {
        userData[userId] = { coins: 100, xp: 0, wins: 0 };
    }
    return userData[userId];
}

client.once('ready', () => {
    console.log(`✅ البوت يعمل بنجاح باسم: ${client.user.tag}`);
});

// التعامل مع أوامر السلاش (Slash Commands) لمنع خطأ Application did not respond
client.on('interactionCreate', async interaction => {
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'ping') {
            await interaction.reply({ content: '🏓 Pong! البوت متصل وشغال تمام.', ephemeral: true });
        }
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // === 🔪 لعبة مافيا (3 دقائق وقت انضمام - حتى 100 لاعب) ===
    if (command === 'مافيا') {
        if (activeGames[message.channel.id]) {
            return message.reply('⚠️ هناك لعبة جارية بالفعل في هذا الروم!');
        }

        activeGames[message.channel.id] = true;
        let players = [message.author];
        const MAX_PLAYERS = 100;
        const WAIT_TIME = 180000; // 3 دقائق

        const getGameEmbed = () => new EmbedBuilder()
            .setColor(0x8E44AD)
            .setTitle('🔪 مافيا — لعبة الأدوار')
            .setDescription(`👥 **اللاعبين الآن:** \`${players.length}/${MAX_PLAYERS}\`\n⏳ **ينتهي الانضمام:** <t:${Math.floor((Date.now() + WAIT_TIME) / 1000)}:R>\n\nاضغط على **دخول** للانضمام إلى اللعبة!`)
            .setFooter({ text: 'Hollywood Games' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('join_mafia')
                .setLabel('دخول 🎭')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('leave_mafia')
                .setLabel('خروج 🚪')
                .setStyle(ButtonStyle.Danger)
        );

        const gameMsg = await message.channel.send({
            embeds: [getGameEmbed()],
            components: [row]
        });

        const collector = gameMsg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: WAIT_TIME
        });

        collector.on('collect', async i => {
            if (i.customId === 'join_mafia') {
                if (players.some(p => p.id === i.user.id)) {
                    return i.reply({ content: '⚠️ أنت مشترك بالفعل في اللعبة!', ephemeral: true });
                }
                if (players.length >= MAX_PLAYERS) {
                    return i.reply({ content: '❌ اللعبة مكتملة (100/100)!', ephemeral: true });
                }
                players.push(i.user);
                await i.reply({ content: '✅ تم انضمامك للعبة بنجاح!', ephemeral: true });
                await gameMsg.edit({ embeds: [getGameEmbed()] });
            } else if (i.customId === 'leave_mafia') {
                if (!players.some(p => p.id === i.user.id)) {
                    return i.reply({ content: '⚠️ أنت لست باللعبة بالأصل!', ephemeral: true });
                }
                players = players.filter(p => p.id !== i.user.id);
                await i.reply({ content: '🚪 تم خروجك من اللعبة.', ephemeral: true });
                await gameMsg.edit({ embeds: [getGameEmbed()] });
            }
        });

        collector.on('end', async () => {
            row.components.forEach(c => c.setDisabled(true));
            await gameMsg.edit({ components: [row] });

            if (players.length < 3) {
                delete activeGames[message.channel.id];
                return message.channel.send('❌ تم إلغاء اللعبة لعدم اكتمال النصاب (المطلوب 3 لاعبين على الأقل).');
            }

            message.channel.send(`🎭 **تم تسجيل ${players.length} لاعبين! جاري توزيع الأدوار وبدء الجولة...**`);
            delete activeGames[message.channel.id];
        });
    }

    // === 🎡 لعبة الروليت (3 دقائق انضمام - حتى 100 لاعب) ===
    if (command === 'روليت') {
        if (activeGames[message.channel.id]) {
            return message.reply('⚠️ هناك لعبة جارية في هذا الروم!');
        }

        activeGames[message.channel.id] = true;
        let players = [message.author];
        const MAX_PLAYERS = 100;
        const WAIT_TIME = 180000; // 3 دقائق

        const getRouletteEmbed = () => new EmbedBuilder()
            .setColor(0xE74C3C)
            .setTitle('🎡 روليت — لعبة الطرد الجماعية')
            .setDescription(`👥 **اللاعبين الآن:** \`${players.length}/${MAX_PLAYERS}\`\n⏳ **ينتهي الانضمام:** <t:${Math.floor((Date.now() + WAIT_TIME) / 1000)}:R>\n\nاضغط زر **انضمام** للاشتراك!`)
            .setFooter({ text: 'Hollywood Games' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('join_roulette')
                .setLabel('انضمام 🎡')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('leave_roulette')
                .setLabel('خروج 🚪')
                .setStyle(ButtonStyle.Secondary)
        );

        const gameMsg = await message.channel.send({
            embeds: [getRouletteEmbed()],
            components: [row]
        });

        const collector = gameMsg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: WAIT_TIME
        });

        collector.on('collect', async i => {
            if (i.customId === 'join_roulette') {
                if (players.some(p => p.id === i.user.id)) {
                    return i.reply({ content: '⚠️ أنت مضاف باللعبة سابقاً!', ephemeral: true });
                }
                if (players.length >= MAX_PLAYERS) {
                    return i.reply({ content: '❌ وصلت اللعبة للحد الأقصى (100 لاعب)!', ephemeral: true });
                }
                players.push(i.user);
                await i.reply({ content: '✅ تم الانضمام للروليت!', ephemeral: true });
                await gameMsg.edit({ embeds: [getRouletteEmbed()] });
            } else if (i.customId === 'leave_roulette') {
                players = players.filter(p => p.id !== i.user.id);
                await i.reply({ content: '🚪 خرجت من اللعبة.', ephemeral: true });
                await gameMsg.edit({ embeds: [getRouletteEmbed()] });
            }
        });

        collector.on('end', async () => {
            row.components.forEach(c => c.setDisabled(true));
            await gameMsg.edit({ components: [row] });

            if (players.length < 2) {
                delete activeGames[message.channel.id];
                return message.channel.send('❌ تم إلغاء الروليت لعدم وجود لاعبين كافيين.');
            }

            message.channel.send(`💥 **بدأت التصفيات بين ${players.length} لاعبين!**`);

            const interval = setInterval(() => {
                if (players.length === 1) {
                    clearInterval(interval);
                    const winner = players[0];
                    const p = getUser(winner.id);
                    p.coins += 250;
                    p.wins += 1;
                    delete activeGames[message.channel.id];
                    return message.channel.send(`🏆 **الفائز الأخير في الروليت هو <@${winner.id}>!** وفاز بـ **250 عملة** 💰!`);
                }

                const eliminatedIndex = Math.floor(Math.random() * players.length);
                const eliminated = players.splice(eliminatedIndex, 1)[0];
                message.channel.send(`☠️ تم استبعاد **${eliminated.username}**! المتبقين: **${players.length}**`);
            }, 2500);
        });
    }
});

client.login(process.env.TOKEN);
                }
                players = players.filter(p => p.id !== i.user.id);
                await i.reply({ content: '🚪 تم خروجك من اللعبة.', ephemeral: true });
                await gameMsg.edit({ embeds: [getGameEmbed()] });
            }
        });

        collector.on('end', async () => {
            row.components.forEach(c => c.setDisabled(true));
            await gameMsg.edit({ components: [row] });

            if (players.length < 3) {
                delete activeGames[message.channel.id];
                return message.channel.send('❌ تم إلغاء اللعبة لعدم اكتمال النصاب (المطلوب 3 لاعبين على الأقل).');
            }

            message.channel.send(`🎭 **تم تسجيل ${players.length} لاعبين! جاري توزيع الأدوار وبدء الجولة...**`);
            delete activeGames[message.channel.id];
        });
    }

    // === 🎡 لعبة الروليت (3 دقائق انضمام - حتى 100 لاعب) ===
    if (command === 'روليت') {
        if (activeGames[message.channel.id]) {
            return message.reply('⚠️ هناك لعبة جارية في هذا الروم!');
        }

        activeGames[message.channel.id] = true;
        let players = [message.author];
        const MAX_PLAYERS = 100;
        const WAIT_TIME = 180000; // 3 دقائق

        const getRouletteEmbed = () => new EmbedBuilder()
            .setColor(0xE74C3C)
            .setTitle('🎡 روليت — لعبة الطرد الجماعية')
            .setDescription(`👥 **اللاعبين الآن:** \`${players.length}/${MAX_PLAYERS}\`\n⏳ **ينتهي الانضمام:** <t:${Math.floor((Date.now() + WAIT_TIME) / 1000)}:R>\n\nاضغط زر **انضمام** للاشتراك!`)
            .setFooter({ text: 'Hollywood Games' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('join_roulette')
                .setLabel('انضمام 🎡')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('leave_roulette')
                .setLabel('خروج 🚪')
                .setStyle(ButtonStyle.Secondary)
        );

        const gameMsg = await message.channel.send({
            embeds: [getRouletteEmbed()],
            components: [row]
        });

        const collector = gameMsg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: WAIT_TIME
        });

        collector.on('collect', async i => {
            if (i.customId === 'join_roulette') {
                if (players.some(p => p.id === i.user.id)) {
                    return i.reply({ content: '⚠️ أنت مضاف باللعبة سابقاً!', ephemeral: true });
                }
                if (players.length >= MAX_PLAYERS) {
                    return i.reply({ content: '❌ وصلت اللعبة للحد الأقصى (100 لاعب)!', ephemeral: true });
                }
                players.push(i.user);
                await i.reply({ content: '✅ تم الانضمام للروليت!', ephemeral: true });
                await gameMsg.edit({ embeds: [getRouletteEmbed()] });
            } else if (i.customId === 'leave_roulette') {
                players = players.filter(p => p.id !== i.user.id);
                await i.reply({ content: '🚪 خرجت من اللعبة.', ephemeral: true });
                await gameMsg.edit({ embeds: [getRouletteEmbed()] });
            }
        });

        collector.on('end', async () => {
            row.components.forEach(c => c.setDisabled(true));
            await gameMsg.edit({ components: [row] });

            if (players.length < 2) {
                delete activeGames[message.channel.id];
                return message.channel.send('❌ تم إلغاء الروليت لعدم وجود لاعبين كافيين.');
            }

            message.channel.send(`💥 **بدأت التصفيات بين ${players.length} لاعبين!**`);

            const interval = setInterval(() => {
                if (players.length === 1) {
                    clearInterval(interval);
                    const winner = players[0];
                    const p = getUser(winner.id);
                    p.coins += 250;
                    p.wins += 1;
                    delete activeGames[message.channel.id];
                    return message.channel.send(`🏆 **الفائز الأخير في الروليت هو <@${winner.id}>!** وفاز بـ **250 عملة** 💰!`);
                }

                const eliminatedIndex = Math.floor(Math.random() * players.length);
                const eliminated = players.splice(eliminatedIndex, 1)[0];
                message.channel.send(`☠️ تم استبعاد **${eliminated.username}**! المتبقين: **${players.length}**`);
            }, 2500);
        });
    }
});

client.login(process.env.TOKEN);
        return message.reply('pong! 🏓 البوت يعمل بنجاح!');
    }

    // أمر +بروفايل أو +فلوسي
    if (command === 'profile' || command === 'بروفايل' || command === 'فلوسي') {
        return message.reply({
            embeds: [{
                color: 0xE74C3C,
                title: `🎮 ملف اللاعب: ${message.author.username}`,
                fields: [
                    { name: '💰 العملات', value: `${player.coins} عملة`, inline: true },
                    { name: '⭐ الـ XP', value: `${player.xp} XP`, inline: true }
                ],
                thumbnail: { url: message.author.displayAvatarURL() }
            }]
        });
    }

    // أمر +يومي
    if (command === 'daily' || command === 'يومي') {
        const now = Date.now();
        const cooldown = 24 * 60 * 60 * 1000;

        if (now - player.lastDaily < cooldown) {
            const remainingHours = Math.ceil((cooldown - (now - player.lastDaily)) / (1000 * 60 * 60));
            return message.reply(`⏳ أخذت مكافأتك اليومية! ارجع بعد ${remainingHours} ساعة.`);
        }

        player.coins += 250;
        player.xp += 50;
        player.lastDaily = now;

        return message.reply(`🎁 **مبروك!** حصلت على **250 عملة** 💰 و **50 XP** ⭐!`);
    }

    // أمر +اسرع (لعبة أسرع كتابة)
    if (command === 'اسرع' || command === 'fastwrite') {
        const randomWord = fastWords[Math.floor(Math.random() * fastWords.length)];
        
        await message.channel.send(`⚡ **تحدي أسرع كتابة!**\nأول شخص يكتب الكلمة التالية يفوز بـ **100 عملة** 💰:\n\n👉 **\`${randomWord}\`**`);

        const filter = m => m.content === randomWord && !m.author.bot;
        const collector = message.channel.createMessageCollector({ filter, time: 15000, max: 1 });

        collector.on('collect', m => {
            const winner = getUser(m.author.id);
            winner.coins += 100;
            winner.xp += 20;
            m.reply(`🎉 كفو! **${m.author.username}** كتبها الأول بأسرع وقت! وفاز بـ **100 عملة** 💰 و **20 XP** ⭐!`);
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                message.channel.send('⏰ انتهى الوقت وما أحد كتب الكلمة صح!');
            }
        });
    }

    // أمر +مافيا (تجهيز لعبة المافيا)
    if (command === 'مافيا' || command === 'mafia') {
        return message.reply('🕵️‍♂️ **بدء تجمع لعبة المافيا!**\nاكتبوا `انضمام` للتدخول في الجولة! (يحتاج 3 لاعبين على الأقل للبدء).');
    }
});

client.login(process.env.TOKEN);
