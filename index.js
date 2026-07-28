const { Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// البادئة الخاصة بالأوامر
const PREFIX = '+';

// قاعدة بيانات بسيطة في الذاكرة للعملات والـ XP
const userData = {};

function getUser(userId) {
    if (!userData[userId]) {
        userData[userId] = { coins: 100, xp: 0, lastDaily: 0 };
    }
    return userData[userId];
}

// قائمة كلمات للعبة أسرع كتابة
const fastWords = [
    "ديسكورد", "برمجة", "ريدلاند", "العاب", "تحدي", "سريع", "سيرفر", "عبقري", "مستقبل", "إبداع"
];

client.once('ready', () => {
    console.log(`✅ تم تشغيل البوت بنجاح باسم: ${client.user.tag}`);
});

// التفاعل مع الرسائل بالبادئة +
client.on('messageCreate', async message => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const player = getUser(message.author.id);

    // أمر +help أو +مساعدة أو +اوامر
    if (command === 'help' || command === 'مساعدة' || command === 'اوامر') {
        const helpEmbed = new EmbedBuilder()
            .setColor(0xE74C3C)
            .setTitle('🎮 قائمة أوامر Redland Games')
            .setDescription('أهلاً بك! هذه قائمة جميع الأوامر والألعاب المتاحة حالياً باستخدام البادئة `+`')
            .addFields(
                { 
                    name: '🎁 الاقتصاد والمكافآت والجرائم', 
                    value: '`+يومي` - للحصول على المكافأة اليومية (250 عملة + 50 XP)\n`+فلوسي` - لفتح ملفك الشخصي ورؤية عملاتك والـ XP\n`+شراء` - معلومات شراء العملات بالكريدت' 
                },
                { 
                    name: '⚡ الألعاب المتوفرة', 
                    value: '`+اسرع` - التنافس في لعبة أسرع كتابة وكسب العملات\n`+مافيا` - بدء لعبة المافيا مع الأعضاء' 
                },
                { 
                    name: '👑 أوامر الإدارة والتحكم', 
                    value: '`+اضف_نقاط @العضو العدد` - لإضافة نقاط أو عملات لأي لاعب (للمشرفين فقط)' 
                },
                { 
                    name: '⚙️ أوامر النظام', 
                    value: '`+بينج` - لفحص سرعة استجابة البوت' 
                }
            )
            .setFooter({ text: 'Redland Games • متجر وشراء النقاط مفعّل!' })
            .setTimestamp();

        return message.reply({ embeds: [helpEmbed] });
    }

    // أمر إدارة: إضافة نقاط/عملات لنفسك أو لأي عضو
    if (command === 'اضف_نقاط' || command === 'addcoins') {
        // التحقق من صلاحيات المشرف
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply('❌ هذا الأمر مخصص للإدارة فقط!');
        }

        const targetUser = message.mentions.users.first() || message.author;
        const amount = parseInt(args[1]) || parseInt(args[0]);

        if (!amount || isNaN(amount)) {
            return message.reply('⚠️ يرجى تحديد عدد النقاط الصحيح! مثال: `+اضف_نقاط 500` أو `+اضف_نقاط @عبقري 500`');
        }

        const targetPlayer = getUser(targetUser.id);
        targetPlayer.coins += amount;

        return message.reply(`✅ تم بنجاح إضافة **${amount}** عملة/نقطة إلى حساب **${targetUser.username}**! 💰\nرصيده الحالي: **${targetPlayer.coins}** عملة.`);
    }

    // أمر +شراء (متجر العملات والكريدت)
    if (command === 'شراء' || command === 'متجر' || command === 'buy') {
        const shopEmbed = new EmbedBuilder()
            .setColor(0xF1C40F)
            .setTitle('🛒 متجر نقاط وعملات Redland')
            .setDescription('يمكنك شراء العملات لاستخدامها في ألعاب المافيا والروليت وغيرها عَبْر الكريدت!')
            .addFields(
                { name: '💎 السعر الرسمي', value: '**100 عملة = 5,000,000 (5M) كريدت**', inline: false },
                { name: '📜 طريقة الشراء', value: 'قم بتحويل المبلغ للبوت باستخدام برو بوب عبر الأمر:\n`#credit <@' + client.user.id + '> 5000000`\nثم تواصل مع الإدارة لشحن النقاط فوراً!', inline: false }
            )
            .setFooter({ text: 'للشراء المباشر أو الاستفسارات تواصل مع إداريي السيرفر.' });

        return message.reply({ embeds: [shopEmbed] });
    }

    // أمر +بينج
    if (command === 'ping' || command === 'بينج') {
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
