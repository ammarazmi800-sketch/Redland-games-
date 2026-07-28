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
        userData[userId] = { coins: 100, xp: 0, wins: 0, lastDaily: 0 };
    }
    return userData[userId];
}

function addReward(userId, coins, xp) {
    const user = getUser(userId);
    user.coins += coins;
    user.xp += xp;
}

client.once('ready', () => {
    console.log(`✅ البوت متصل بنجاح باسم: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'ping') {
        await interaction.reply({ content: '🏓 Pong! البوت متصل وجاهز.', ephemeral: true });
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ==================== 📜 قائمة الألعاب ====================
    if (command === 'help' || command === 'العاب') {
        const embed = new EmbedBuilder()
            .setColor(0xE74C3C)
            .setTitle('🎮 قائمة ألعاب Redland Games')
            .setDescription(
                'مرحباً بك! إليك الأوامر المتاحة حالياً:\n\n' +
                '🎯 **الألعاب الجماعية (تتسع حتى 100 لاعب - وقت الانضمام 3 دقائق):**\n' +
                '• `+مافيا` : لعبة المافيا والأدوار المتقدمة\n' +
                '• `+روليت` : لعبة الاستبعاد والتصفية الجماعية\n\n' +
                '⚡ **ألعاب السرعة والتخمين:**\n' +
                '• `+اسرع` | `+لاعب` | `+فكك` | `+اعكس` | `+رياضيات` | `+علم`\n\n' +
                '💰 **الاقتصاد:**\n' +
                '• `+يومي` : مكافأة يومية\n' +
                '• `+فلوسي` : عرض الرصيد والإحصائيات'
            )
            .setFooter({ text: 'Redland Games' });

        return message.reply({ embeds: [embed] });
    }

    // ==================== 💰 الاقتصاد ====================
    if (command === 'يومي') {
        const user = getUser(message.author.id);
        const now = Date.now();
        const cooldown = 24 * 60 * 60 * 1000;

        if (now - user.lastDaily < cooldown) {
            const remaining = Math.ceil((cooldown - (now - user.lastDaily)) / (1000 * 60 * 60));
            return message.reply(`⌛ لقد حصلت على المكافأة اليومية بالفعل! عد بعد \`${remaining}\` ساعة.`);
        }

        user.lastDaily = now;
        addReward(message.author.id, 250, 50);
        return message.reply('🎁 **تم إضافة المكافأة اليومية!** حصلت على **250 عملة** 💰 و **50 XP** ⭐!');
    }

    if (command === 'فلوسي' || command === 'نقاطي') {
        const user = getUser(message.author.id);
        const embed = new EmbedBuilder()
            .setColor(0xF1C40F)
            .setTitle(`📊 ملف اللاعب: ${message.author.username}`)
            .addFields(
                { name: '💰 العملات:', value: `\`${user.coins}\``, inline: true },
                { name: '⭐ نقاط XP:', value: `\`${user.xp}\``, inline: true },
                { name: '🏆 الانتصارات:', value: `\`${user.wins}\``, inline: true }
            );
        return message.reply({ embeds: [embed] });
    }

    // ==================== 🔪 1. لعبة المافيا (100 لاعب - 3 دقائق) ====================
    if (command === 'مافيا') {
        if (activeGames[message.channel.id]) {
            return message.reply('⚠️ هناك لعبة جارية بالفعل في هذه القناة!');
        }

        activeGames[message.channel.id] = true;
        let players = [message.author];
        const MAX_PLAYERS = 100;
        const WAIT_TIME = 180000; // 3 دقائق

        const getGameEmbed = () => new EmbedBuilder()
            .setColor(0x8E44AD)
            .setTitle('🔪 مافيا — لعبة الأدوار والتصويت')
            .setDescription(
                `👥 **اللاعبون المسجلون:** \`${players.length}/${MAX_PLAYERS}\`\n` +
                `⏳ **ينتهي وقت الانضمام:** <t:${Math.floor((Date.now() + WAIT_TIME) / 1000)}:R>\n\n` +
                `اضغط الأزرار أدناه للدخول أو الخروج!`
            )
            .setFooter({ text: 'Redland Games' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('join_mafia').setLabel('دخول 🎭').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('leave_mafia').setLabel('خروج 🚪').setStyle(ButtonStyle.Danger)
        );

        const gameMsg = await message.channel.send({ embeds: [getGameEmbed()], components: [row] });
        const collector = gameMsg.createMessageComponentCollector({ componentType: ComponentType.Button, time: WAIT_TIME });

        collector.on('collect', async i => {
            if (i.customId === 'join_mafia') {
                if (players.some(p => p.id === i.user.id)) return i.reply({ content: '⚠️ أنت مضاف بالفعل!', ephemeral: true });
                if (players.length >= MAX_PLAYERS) return i.reply({ content: '❌ اكتمل العدد الأقصى (100 لاعب)!', ephemeral: true });
                
                players.push(i.user);
                await i.reply({ content: '✅ تم الانضمام بنجاح!', ephemeral: true });
                await gameMsg.edit({ embeds: [getGameEmbed()] });
            } else if (i.customId === 'leave_mafia') {
                if (!players.some(p => p.id === i.user.id)) return i.reply({ content: '⚠️ أنت لست مسجلاً!', ephemeral: true });
                
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
                return message.channel.send('❌ تم إلغاء لعبة المافيا (يتطلب 3 لاعبين على الأقل).');
            }

            const mafiaIndex = Math.floor(Math.random() * players.length);
            const mafiaUser = players[mafiaIndex];

            const roleRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('check_role').setLabel('اعرف دورك 🎭').setStyle(ButtonStyle.Primary)
            );

            message.channel.send({
                content: `🎭 **تم تسجيل ${players.length} لاعبين وتوزيع الأدوار!** اضغطوا الزر لمعرفة أدواركم سرّاً:`,
                components: [roleRow]
            });

            const roleCollector = message.channel.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });
            roleCollector.on('collect', async i => {
                if (!players.some(p => p.id === i.user.id)) return i.reply({ content: '❌ أنت لست مسجلاً بهذه الجولة!', ephemeral: true });
                const role = i.user.id === mafiaUser.id ? '🔪 أنت المافيا! حاول القضاء على المواطنين بدون كشفك.' : '🛡️ أنت مواطن صالح! حاول اكتشاف المافيا والتصويت عليه.';
                await i.reply({ content: role, ephemeral: true });
            });

            delete activeGames[message.channel.id];
        });
    }

    // ==================== 🎡 2. لعبة الروليت (100 لاعب - 3 دقائق) ====================
    if (command === 'روليت') {
        if (activeGames[message.channel.id]) return message.reply('⚠️ هناك لعبة جارية بالفعل!');

        activeGames[message.channel.id] = true;
        let players = [message.author];
        const MAX_PLAYERS = 100;
        const WAIT_TIME = 180000; // 3 دقائق

        const getRouletteEmbed = () => new EmbedBuilder()
            .setColor(0xE74C3C)
            .setTitle('🎡 روليت — لعبة الطرد والتصفية الجماعية')
            .setDescription(
                `👥 **اللاعبون المسجلون:** \`${players.length}/${MAX_PLAYERS}\`\n` +
                `⏳ **ينتهي وقت الانضمام:** <t:${Math.floor((Date.now() + WAIT_TIME) / 1000)}:R>`
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('join_roulette').setLabel('انضمام 🎡').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('leave_roulette').setLabel('خروج 🚪').setStyle(ButtonStyle.Secondary)
        );

        const gameMsg = await message.channel.send({ embeds: [getRouletteEmbed()], components: [row] });
        const collector = gameMsg.createMessageComponentCollector({ componentType: ComponentType.Button, time: WAIT_TIME });

        collector.on('collect', async i => {
            if (i.customId === 'join_roulette') {
                if (players.some(p => p.id === i.user.id)) return i.reply({ content: '⚠️ أنت مضاف بالفعل!', ephemeral: true });
                if (players.length >= MAX_PLAYERS) return i.reply({ content: '❌ وصلت اللعبة للحد الأقصى (100 لاعب)!', ephemeral: true });

                players.push(i.user);
                await i.reply({ content: '✅ تم الانضمام للروليت!', ephemeral: true });
                await gameMsg.edit({ embeds: [getRouletteEmbed()] });
            } else if (i.customId === 'leave_roulette') {
                if (!players.some(p => p.id === i.user.id)) return i.reply({ content: '⚠️ أنت لست مسجلاً!', ephemeral: true });

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
                return message.channel.send('❌ تم إلغاء الروليت لعدم وجود عدد كافٍ من اللاعبين.');
            }

            message.channel.send(`💥 **بدأت التصفيات بين ${players.length} لاعبين!**`);
            const interval = setInterval(() => {
                if (players.length === 1) {
                    clearInterval(interval);
                    const winner = players[0];
                    addReward(winner.id, 250, 50);
                    getUser(winner.id).wins += 1;
                    delete activeGames[message.channel.id];
                    return message.channel.send(`🏆 **الفائز الأخير في الروليت هو <@${winner.id}>!** واستلم **250 عملة** 💰!`);
                }
                const eliminatedIndex = Math.floor(Math.random() * players.length);
                const eliminated = players.splice(eliminatedIndex, 1)[0];
                message.channel.send(`☠️ تم استبعاد **${eliminated.username}**! المتبقون: **${players.length}**`);
            }, 3000);
        });
    }

    // ==================== ⚡ 3. ألعاب السرعة والتخمين ====================
    if (command === 'اسرع') {
        const words = ['برشلونة', 'دراجون', 'روبلوكس', 'دريم', 'افتار', 'سيرفر'];
        const word = words[Math.floor(Math.random() * words.length)];

        message.channel.send(`⚡ **أسرع واحد يكتب الكلمة التالية يفوز:**\n\n> **\`${word}\`**`);

        const filter = m => m.content === word && !m.author.bot;
        const answerCollector = message.channel.createMessageCollector({ filter, time: 30000, max: 1 });

        answerCollector.on('collect', m => {
            addReward(m.author.id, 50, 15);
            m.reply(`🎉 **كفو! إجابة صحيحة وسريعة!** فزت بـ **50 عملة** 💰 و **15 XP** ⭐.`);
        });
    }

    if (command === 'لاعب') {
        const embed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle('⚽ خمن اسم اللاعب من صورته')
            .setDescription('⏰ **الوقت المتاح:** 45 ثانية\n\n✏️ اكتب إجابتك في الشات مباشرة!')
            .setImage('https://upload.wikimedia.org/wikipedia/commons/b/b4/Lionel-Messi-Argentina-2022-World-Cup_%28cropped%29.jpg');

        message.channel.send({ embeds: [embed] });

        const filter = m => (m.content.includes('ميسي') || m.content.toLowerCase().includes('messi')) && !m.author.bot;
        const collector = message.channel.createMessageCollector({ filter, time: 45000, max: 1 });

        collector.on('collect', m => {
            addReward(m.author.id, 100, 25);
            m.reply('🎉 **إجابة صحيحة!** إنه **ليونيل ميسي** 🐐. حصلت على **100 عملة**!');
        });
    }
});

client.login(process.env.TOKEN);
