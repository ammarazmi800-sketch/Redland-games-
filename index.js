const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const userData = new Map();
const activeGames = new Map();

function getUser(userId) {
    if (!userData.has(userId)) {
        userData.set(userId, { 
            coins: 100, 
            xp: 0, 
            inventory: { nuke: 0, shield: 0, mask: 0, hint: 0, speed: 0 },
            lastDaily: null, 
            lastRob: null 
        });
    }
    return userData.get(userId);
}

client.once('ready', () => {
    console.log(`✅ البوت متصل بنجاح باسم: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const prefix = '+';
    if (!message.content.startsWith(prefix)) return;

    // استخراج الأمر والوسائط لدعم الأوامر المتكونة من كلمتين مثل (اعطاء نقاط)
    const rawContent = message.content.slice(prefix.length).trim();
    
    // --- أمر إعطاء النقاط (يدعم: +اعطاء_نقاط و +اعطاء نقاط) ---
    if (rawContent.startsWith('اعطاء_نقاط') || rawContent.startsWith('اعطاء نقاط')) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ هذا الأمر مخصص للمشرفين والإدارة فقط!');
        }

        const args = rawContent.replace(/^اعطاء[_ ]نقاط/, '').trim().split(/ +/);
        const target = message.mentions.users.first();
        const amount = parseInt(args.find(arg => !isNaN(arg) && !arg.includes('<@')));

        if (!target || isNaN(amount)) {
            return message.reply('❌ استخدام خاطئ! الصيغة الصحيحة:\n`+اعطاء نقاط @العضو 5000` أو `+اعطاء_نقاط @العضو 5000`');
        }

        const user = getUser(target.id);
        user.coins += amount;

        const successEmbed = new EmbedBuilder()
            .setColor('#00FF00')
            .setDescription(`✅ **تمت إضافة ${amount} 🪙 إلى رصيد <@${target.id}> بنجاح!**\nرصيده الحالي: **${user.coins} 🪙**`);

        return message.channel.send({ embeds: [successEmbed] });
    }

    const args = rawContent.split(/ +/);
    const command = args.shift().toLowerCase();

    // --- قائمة الألعاب المحدثة ---
    if (command === 'العاب') {
        const menuEmbed = new EmbedBuilder()
            .setColor('#E74C3C')
            .setTitle('🎲 **Redland Games — قائمة الألعاب والمتجر**')
            .setDescription('اكتب الأمر لتجربة الألعاب الممتعة! 🚀\n\n' +
                '----------------------------------------\n' +
                '🎲 **`+روليت`** | 🕵️‍♂️ **`+مافيا`** | 🪑 **`+كراسي`**\n' +
                '🙈 **`+غميضة`** | 🤔 **`+سالفة`** | 💣 **`+قنبلة`**\n' +
                '⚔️ **`+مبارزة`** | 🎯 **`+تخمين`** | 🧠 **`+اسئلة`**\n' +
                '⚡ **`+اسرع`** | 🥷 **`+سرقة`**\n' +
                '----------------------------------------\n' +
                '🛒 **`+متجر`** | لشراء القوة والمزايا للألعاب\n' +
                '🎒 **`+حقيبتي`** | لرؤية أدواتك المشتراة\n' +
                '🏆 **`+متصدرين`** | **`+بروفايل`** | **`+يومي`**\n' +
                '----------------------------------------\n' +
                '💳 **`+شراء`** | شراء نقاط بالكريدت (5M)\n' +
                '👑 **`+اعطاء نقاط`** | منح نقاط للاعبين (للمشرفين)')
            .setFooter({ text: 'Redland Games • نظام القدرات متوفر بالمتجر' });

        return message.channel.send({ embeds: [menuEmbed] });
    }

    // --- المتجر الشامل ---
    if (command === 'متجر') {
        const storeEmbed = new EmbedBuilder()
            .setColor('#F1C40F')
            .setTitle('🛒 **متجر Mazaia Redland Games**')
            .setDescription('اشترِ المزايا واستخدم قدراتك الخاصة للسيطرة على الروم! 🔥\n\n' +
                '🚀 **1. نيوك (Nuke)** — **5,000 نقطة** (`+شراء_نيوك`)\n└ يستبعد شخصين في لعبة الروليت.\n\n' +
                '🛡️ **2. درع الحماية** — **2,000 نقطة** (`+شراء_درع`)\n└ يحميك من الاغتيال بالمافيا.\n\n' +
                '🥷 **3. قناع السرقة** — **2,500 نقطة** (`+شراء_قناع`)\n└ يرفع نسبة نجاح السرقة لـ 80%.\n\n' +
                '💡 **4. تلميح السالفة** — **3,500 نقطة** (`+شراء_تلميح`)\n└ يعطيك إشارة عن السالفة دون كشفك.\n\n' +
                '⚡ **5. دفعة الكراسي** — **1,000 نقطة** (`+شراء_سرعة`)\n└ تضمن لك مقعداً أسرع في الكراسي الموسيقية.')
            .setFooter({ text: 'لفتح حقيبتك اكتب: +حقيبتي' });

        return message.channel.send({ embeds: [storeEmbed] });
    }

    // --- الشراء من المتجر ---
    if (command === 'شراء_نيوك') {
        const user = getUser(message.author.id);
        if (user.coins < 5000) return message.reply('❌ لا تملك نقاط كافية! سعر النيوك 5,000 نقطة.');
        user.coins -= 5000; user.inventory.nuke += 1;
        return message.reply('🚀 **تم شراء قنبلة نيوك بنجاح!**');
    }

    if (command === 'شراء_درع') {
        const user = getUser(message.author.id);
        if (user.coins < 2000) return message.reply('❌ لا تملك نقاط كافية! سعر الدرع 2,000 نقطة.');
        user.coins -= 2000; user.inventory.shield += 1;
        return message.reply('🛡️ **تم شراء درع الحماية بنجاح!**');
    }

    if (command === 'حقيبتي') {
        const user = getUser(message.author.id);
        const inv = user.inventory;
        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle(`🎒 **حقيبة العناصر لـ ${message.author.username}**`)
            .setDescription(`🚀 **نيوك:** ${inv.nuke}\n🛡️ **دروع:** ${inv.shield}\n🥷 **أقنعة:** ${inv.mask}\n💡 **تلميحات:** ${inv.hint}`);
        return message.reply({ embeds: [embed] });
    }

    // --- أمر سرقة ---
    if (command === 'سرقة' || command === 'سرقه') {
        const target = message.mentions.users.first();
        if (!target || target.id === message.author.id || target.bot) {
            return message.reply('❌ حدد عضواً صحيحاً لسرقته! مثال: `+سرقة @user`');
        }

        const stealer = getUser(message.author.id);
        const victim = getUser(target.id);

        const now = Date.now();
        if (stealer.lastRob && now - stealer.lastRob < 300000) {
            const leftSecs = Math.ceil((300000 - (now - stealer.lastRob)) / 1000);
            return message.reply(`⏳ انتظر **${leftSecs} ثانية** قبل المحاولة التالية!`);
        }

        if (victim.coins < 50) return message.reply('❌ هذا العضو مفلس ولا يملك مالاً لسرقته!');

        stealer.lastRob = now;
        let successChance = 0.5;

        if (stealer.inventory.mask > 0) {
            stealer.inventory.mask -= 1;
            successChance = 0.8;
            message.channel.send('🥷 **استخدمت قناع الاختفاء لرفع نسبة النجاح إلى 80%!**');
        }

        if (Math.random() < successChance) {
            const stolenAmount = Math.floor(Math.random() * (victim.coins * 0.3)) + 15;
            victim.coins -= stolenAmount;
            stealer.coins += stolenAmount;
            return message.reply(`🥷 **نجحت السرقة!** سرقت **${stolenAmount} 🪙** من <@${target.id}>!`);
        } else {
            const fine = 30;
            stealer.coins = Math.max(0, stealer.coins - fine);
            return message.reply(`🚨 **تم القبض عليك!** وغرمت **${fine} 🪙**!`);
        }
    }

    if (command === 'يومي') {
        const user = getUser(message.author.id);
        const now = Date.now();
        if (user.lastDaily && now - user.lastDaily < 86400000) return message.reply('⏳ استلمت المكافأة اليومية بالفعل!');
        user.coins += 250; user.xp += 50; user.lastDaily = now;
        return message.reply('🎁 **تم استلام 250 عملة 🪙 و 50 XP ⭐!**');
    }

    if (command === 'بروفايل' || command === 'فلوسي') {
        const user = getUser(message.author.id);
        return message.reply(`💳 **الملف الشخصي:**\n🪙 **النقاط/العملات:** ${user.coins}\n⭐ **الـ XP:** ${user.xp}`);
    }
});

client.login('YOUR_BOT_TOKEN_HERE');
  
