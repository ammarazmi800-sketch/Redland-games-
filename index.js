const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const userData = new Map();

function getUser(userId) {
    if (!userData.has(userId)) {
        userData.set(userId, { 
            coins: 200, 
            xp: 0, 
            inventory: { nuke: 0, shield: 0, mask: 0, hint: 0, medkit: 0, magnifying: 0 },
            lastDaily: null, 
            lastRob: null 
        });
    }
    return userData.get(userId);
}

client.once('ready', () => {
    console.log(`✅ بوت Redland Games اشتغل بنجاح باسم: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const prefix = '+';
    if (!message.content.startsWith(prefix)) return;

    const rawContent = message.content.slice(prefix.length).trim();
    
    // --- أمر إضافة وإعطاء النقاط للمشرفين (يدعم +اضافة_نقاط، +اضافة نقاط، +اعطاء_نقاط، +اعطاء نقاط) ---
    if (rawContent.startsWith('اضافة_نقاط') || rawContent.startsWith('اضافة نقاط') || rawContent.startsWith('اعطاء_نقاط') || rawContent.startsWith('اعطاء نقاط')) {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ هذا الأمر للمشرفين فقط!');
        }

        const args = rawContent.replace(/^(اضافة|اعطاء)[_ ]نقاط/, '').trim().split(/ +/);
        const target = message.mentions.users.first();
        const amount = parseInt(args.find(arg => !isNaN(arg) && !arg.includes('<@')));

        if (!target || isNaN(amount)) {
            return message.reply('❌ الصيغة الصحيحة: `+اضافة نقاط @العضو 5000`');
        }

        const user = getUser(target.id);
        user.coins += amount;

        return message.reply(`✅ تمت إضافة **${amount} 🪙** إلى رصيد <@${target.id}> بنجاح!`);
    }

    const args = rawContent.split(/ +/);
    const command = args.shift().toLowerCase();

    // ==========================================
    // 📜 قوائم الألعاب (40 لعبة: 20 جماعي + 20 فردي)
    // ==========================================
    if (command === 'العاب' || command === 'الألعاب') {
        const embed = new EmbedBuilder()
            .setColor('#E74C3C')
            .setTitle('🎮 **Redland Games — قائمة الـ 40 لعبة الشاملة**')
            .setDescription('اختر القسم الذي يناسبك واستمتع بالتحدي! 🔥\n\n' +
                '👥 **`+جماعي`** — عرض الـ 20 لعبة الجماعية (مافيا، روليت، برا السالفة، إلخ)\n' +
                '👤 **`+فردي`** — عرض الـ 20 لعبة الفردية والتحديات الذاتية\n' +
                '🛒 **`+متجر`** — متجر القدرات والأدوات الخاصة\n' +
                '🎒 **`+حقيبتي`** | 🎁 `+يومي` | 💳 `+بروفايل` | 🥷 `+سرقة @عضو`')
            .setFooter({ text: 'Redland Games • نظام الأدوات والمزايا مفعل بالكامل' });
        return message.channel.send({ embeds: [embed] });
    }

    if (command === 'جماعي') {
        const embed = new EmbedBuilder()
            .setColor('#3498DB')
            .setTitle('👥 **الألعاب الجماعية (20 لعبة)**')
            .setDescription(
                '1️⃣ `+روليت` (عجلة الحظ الكبرى مع نيوك الطرد)\n' +
                '2️⃣ `+مافيا` (أدوار: مافيا، طبيب، محقق، مطوان، مدني)\n' +
                '3️⃣ `+كراسي` (الكراسي الموسيقية الحماسية)\n' +
                '4️⃣ `+غميضة` (لعبة الاختباء والبحث)\n' +
                '5️⃣ `+سالفة` أو `+برا_السالفة` (اكتشف من هو برا السالفة مع تلميحات)\n' +
                '6️⃣ `+قنبلة` (تفكيك أسلاك القنبلة الجماعية)\n' +
                '7️⃣ `+مبارزة` (تحدي 1 ضد 1 وربح النقاط)\n' +
                '8️⃣ `+تحدي_السرعة` (سباق كتابة الكلمات)\n' +
                '9️⃣ `+توصيل_الطلبات` | 🔟 `+حرب_القبائل`\n' +
                '1️⃣1️⃣ `+تكلم_بكلمة` | 1️⃣2️⃣ `+الصراحة` | 1️⃣3️⃣ `+البحث_عن_الكنز`\n' +
                '1️⃣4️⃣ `+من_القاتل` | 1️⃣5️⃣ `+اكتب_بسرعة` | 1️⃣6️⃣ `+حجرة_صحر_ورقة`\n' +
                '1️⃣7️⃣ `+اختار_الباب` | 1️⃣8️⃣ `+تحدي_الأسئلة` | 1️⃣9️⃣ `+منزل_الرعب` | 2️⃣0️⃣ `+توقع_الحدث`'
            );
        return message.channel.send({ embeds: [embed] });
    }

    if (command === 'فردي') {
        const embed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle('👤 **الألعاب الفردية (20 لعبة)**')
            .setDescription(
                '1️⃣ `+تخمين` (تخمين الرقم السري)\n' +
                '2️⃣ `+اسئلة` (أسئلة معلومات عامة)\n' +
                '3️⃣ `+اسرع` (تحدي سرعة البديهة)\n' +
                '4️⃣ `+لغز` (ألغاز ذكاء وتفكير)\n' +
                '5️⃣ `+حظك_اليوم` (توقع حظك والعملات)\n' +
                '6️⃣ `+تجميع_الذهب` | 7️⃣ `+رياضيات` | 8️⃣ `+عواصم`\n' +
                '9️⃣ `+معاني_الكلمات` | 🔟 `+ترتيب_الحروف`\n' +
                '1️⃣1️⃣ `+عكس_الكلمات` | 1️⃣2️⃣ `+اختبار_الذكاء` | 1️⃣3️⃣ `+تتبع_الظل`\n' +
                '1️⃣4️⃣ `+صيد_السمك` | 1️⃣5️⃣ `+سباق_السيارات` | 1️⃣6️⃣ `+عجلة_الحظ_الفردية`\n' +
                '1️⃣7️⃣ `+بناء_القلعة` | 1️⃣8️⃣ `+التنقيب_عن_الألماس` | 1️⃣9️⃣ `+المتاهة` | 2️⃣0️⃣ `+تحدي_الذاكرة`'
            );
        return message.channel.send({ embeds: [embed] });
    }

    // ==========================================
    // 🛒 المتجر والمزايا المتقدمة
    // ==========================================
    if (command === 'متجر' || command === 'المتجر') {
        const storeEmbed = new EmbedBuilder()
            .setColor('#F1C40F')
            .setTitle('🛒 **متجر Mazaia Redland Games (قسم النخبة والأسطورة)**')
            .setDescription('اشترِ المزايا وقوّي خطتك في الألعاب عبر الأوامر التالية:\n\n' +
                '🚀 **1. نيوك عجلة الروليت** — **5,000 نقطة** (`+شراء_نيوك`)\n└ يطرد لاعبين اثنين بدلاً من لاعب في عجلة الروليت.\n\n' +
                '🛡️ **2. درع الحماية** — **2,000 نقطة** (`+شراء_درع`)\n└ يحميك من الاغتيال في لعبة المافيا.\n\n' +
                '🔪 **3. سلاح المطوان (للمافيا)** — **3,000 نقطة** (`+شراء_مطوان`)\n└ يزيد قوة تأثيرك الهجومي في المافيا.\n\n' +
                '💉 **4. حقيبة الإسعاف (للطبيب)** — **2,500 نقطة** (`+شراء_طبيب`)\n└ تمنحك فرصة إنقاذ شخص إضافي.\n\n' +
                '🔍 **5. عدسة المحقق** — **2,500 نقطة** (`+شراء_محقق`)\n└ تكشف لك هوية أحد اللاعبين بدقة.\n\n' +
                '🥷 **6. قناع السرقة** — **2,500 نقطة** (`+شراء_قناع`)\n└ يرفع نسبة نجاح السرقة لـ 80%.\n\n' +
                '💡 **7. تلميح السالفة** — **3,500 نقطة** (`+شراء_تلميح`)\n└ يعطيك تلميحاً عن كلمة (برا السالفة).\n\n' +
                '💎 **8. باقة شراء النقاط الفورية** — **5M روبوكس/كريدت** (`+شراء_نقاط`)');
        return message.channel.send({ embeds: [storeEmbed] });
    }

    // عمليات الشراء للمتجر
    if (command === 'شراء_نيوك') {
        const user = getUser(message.author.id);
        if (user.coins < 5000) return message.reply('❌ نقاطك غير كافية! سعر النيوك 5,000 نقطة.');
        user.coins -= 5000; user.inventory.nuke += 1;
        return message.reply('🚀 **تم شراء قنبلة نيوك عجلة الروليت بنجاح!**');
    }
    if (command === 'شراء_درع') {
        const user = getUser(message.author.id);
        if (user.coins < 2000) return message.reply('❌ نقاطك غير كافية! سعر الدرع 2,000 نقطة.');
        user.coins -= 2000; user.inventory.shield += 1;
        return message.reply('🛡️ **تم شراء درع الحماية بنجاح!**');
    }
    if (command === 'شراء_مطوان') {
        const user = getUser(message.author.id);
        if (user.coins < 3000) return message.reply('❌ نقاطك غير كافية! سعر المطوان 3,000 نقطة.');
        user.coins -= 3000; user.inventory.medkit += 1;
        return message.reply('🔪 **تم شراء سلاح المطوان الخاص بالمافيا بنجاح!**');
    }
    if (command === 'شراء_طبيب') {
        const user = getUser(message.author.id);
        if (user.coins < 2500) return message.reply('❌ نقاطك غير كافية! سعر حقيبة الطبيب 2,500 نقطة.');
        user.coins -= 2500; user.inventory.medkit += 1;
        return message.reply('💉 **تم شراء حقيبة إسعاف الطبيب بنجاح!**');
    }
    if (command === 'شراء_محقق') {
        const user = getUser(message.author.id);
        if (user.coins < 2500) return message.reply('❌ نقاطك غير كافية! سعر عدسة المحقق 2,500 نقطة.');
        user.coins -= 2500; user.inventory.magnifying += 1;
        return message.reply('🔍 **تم شراء عدسة المحقق بنجاح!**');
    }
    if (command === 'شراء_قناع') {
        const user = getUser(message.author.id);
        if (user.coins < 2500) return message.reply('❌ نقاطك غير كافية! سعر القناع 2,500 نقطة.');
        user.coins -= 2500; user.inventory.mask += 1;
        return message.reply('🥷 **تم شراء قناع السرقة بنجاح!**');
    }
    if (command === 'شراء_تلميح') {
        const user = getUser(message.author.id);
        if (user.coins < 3500) return message.reply('❌ نقاطك غير كافية! سعر التلميح 3,500 نقطة.');
        user.coins -= 3500; user.inventory.hint += 1;
        return message.reply('💡 **تم شراء تلميح السالفة بنجاح!**');
    }
    if (command === 'شراء_نقاط') {
        return message.reply('💳 **شراء النقاط (5M):** لتمام عملية شحن النقاط برصيد 5M، يرجى فتح تذكرة دعم فني (Ticket) وإرسال إثبات التحويل للإدارة!');
    }

    if (command === 'حقيبتي') {
        const user = getUser(message.author.id);
        const inv = user.inventory;
        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle(`🎒 **حقيبة الأدوات والمزايا لـ ${message.author.username}**`)
            .setDescription(`🚀 **عجلة نيوك الروليت:** ${inv.nuke}\n🛡️ **دروع الحماية:** ${inv.shield}\n🔪 **أسلحة/إسعافات:** ${inv.medkit}\n🔍 **عدسات المحقق:** ${inv.magnifying}\n🥷 **أقنعة السرقة:** ${inv.mask}\n💡 **تلميحات السالفة:** ${inv.hint}`);
        return message.reply({ embeds: [embed] });
    }

    // ==========================================
    // 🎡 لعبة الروليت (عجلة الحظ المتقدمة)
    // ==========================================
    if (command === 'روليت') {
        const user = getUser(message.author.id);
        const hasNuke = user.inventory.nuke > 0;
        
        let wheelResults = ['🪙 ربحت 100 عملة!', '⭐ ربحت 50 نقطة خبرة!', '🚀 تم طرد لاعب!', '💥 انفجرت العجلة عليك!', '👑 تضاعفت نقاطك!'];
        let outcome = wheelResults[Math.floor(Math.random() * wheelResults.length)];

        let msg = `🎡 **تم تدوير عجلة الروليت الكبرى!**\nالنتيجة: **${outcome}**`;
        
        if (hasNuke) {
            user.inventory.nuke -= 1;
            msg += `\n🚀 **[ميزة النيوك مفعلة]:** قمت بتفعيل قنبلة النيوك وطردت لاعبين اثنين معاً من العجلة! (المتبقي: ${user.inventory.nuke})`;
            user.coins += 150;
        } else {
            user.coins += 50;
        }
        user.xp += 20;
        return message.reply(msg);
    }

    // ==========================================
    // 🕵️‍♂️ لعبة المافيا المتطورة (مافيا، مطوان، طبيب، محقق)
    // ==========================================
    if (command === 'مافيا') {
        const user = getUser(message.author.id);
        const roles = ['عضو مافيا (خبيث 🔪)', 'صاحب المطوان الخطير (🗡️)', 'طبيب إنقاذ (🩺)', 'محقق سري (🔍)', 'مواطن بريء (🛡️)'];
        let assignedRole = roles[Math.floor(Math.random() * roles.length)];

        let msg = `🕵️‍♂️ **بدأت لعبة المافيا في الروم!**\nتم توزيع الأدوار سراً على المشاركين...\nدورك في هذه الجولة: **${assignedRole}**`;

        if (assignedRole.includes('مافيا') || assignedRole.includes('المطوان')) {
            msg += `\n⚠️ احذر، لديك صلاحية استخدام الأسلحة والمطوان للإيقاع بالضحايا سراً!`;
        } else if (assignedRole.includes('طبيب')) {
            msg += `\n🩺 يمكنك استخدام حقيبة الإسعاف لحماية وإسعاف الأبرياء من الهجوم.`;
        } else if (assignedRole.includes('محقق')) {
            msg += `\n🔍 يمكنك كشف هوية أحد المشتبه بهم في الجولة القادمة.`;
        }

        user.xp += 30;
        return message.reply(msg);
    }

    // ==========================================
    // 🤔 لعبة برا السالفة المضافة حديثاً
    // ==========================================
    if (command === 'سالفة' || command === 'برا_السالفة') {
        const user = getUser(message.author.id);
        let msg = `🤔 **لعبة برا السالفة!** تم توزيع السالفة على الجميع عدا شخص واحد غامض.`;
        if (user.inventory.hint > 0) {
            user.inventory.hint -= 1;
            msg += `\n💡 **[تلميح ذكي تم استخدامه]:** السالفة تتعلق بـ (عالم التكنولوجيا، الألعاب، والتصميم الرقمي)! (المتبقي: ${user.inventory.hint})`;
        } else {
            msg += ` ابدأوا النقاش واكتشفوا من هو الشخص الذي لا يعرف السالفة وسطكم! (يمكنك شراء تلميح من المتجر)`;
        }
        user.xp += 20;
        return message.reply(msg);
    }

    // ==========================================
    // 🥷 لعبة السرقة المضافة وتفاصيلها
    // ==========================================
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
            return message.reply(`⏳ انتظر **${leftSecs} ثانية** قبل محاولة السرقة القادمة!`);
        }

        if (victim.coins < 50) return message.reply('❌ هذا العضو مفلس ولا يملك أموالاً لسرقتها!');

        stealer.lastRob = now;
        let successChance = 0.5;

        if (stealer.inventory.mask > 0) {
            stealer.inventory.mask -= 1;
            successChance = 0.8;
            message.channel.send('🥷 **استخدمت قناع السرقة الخفي لرفع نسبة نجاحك إلى 80%!**');
        }

        if (Math.random() < successChance) {
            const stolenAmount = Math.floor(Math.random() * (victim.coins * 0.3)) + 20;
            victim.coins -= stolenAmount;
            stealer.coins += stolenAmount;
            return message.reply(`🥷 **نجحت عملية السرقة بنجاح!** سرقت **${stolenAmount} 🪙** من <@${target.id}>!`);
        } else {
            const fine = 40;
            stealer.coins = Math.max(0, stealer.coins - fine);
            return message.reply(`🚨 **فشلت العملية وتم القبض عليك!** تم تغريمك **${fine} 🪙**!`);
        }
    }

    // ==========================================
    // 🪑 بقية الألعاب والفعاليات
    // ==========================================
    if (command === 'كراسي') {
        const user = getUser(message.author.id);
        user.coins += 60; user.xp += 15;
        return message.reply(`🪑 **طاح الموسيقى وحجزت المقعد الأخير بجدارة!** ربحت **60 🪙**.`);
    }

    if (command === 'غميضة') {
        const user = getUser(message.author.id);
        user.coins += 50; user.xp += 15;
        return message.reply(`🙈 نجحت في الاختباء في الزاوية المظلمة ولم يعثر عليك الباحث! ربحت **50 🪙**.`);
    }

    if (command === 'قنبلة') {
        const success = Math.random() > 0.4;
        const user = getUser(message.author.id);
        if (success) {
            user.coins += 120;
            return message.reply(`💣 **بطل!** قطعت السلك الصحيح (الأزرق) ونزعت فتيل القنبلة الجماعية! ربحت **120 🪙**.`);
        } else {
            return message.reply(`💥 **بووووم!** قطعت السلك الخطأ وانفجرت القنبلة في وجه الفريق!`);
        }
    }

    if (command === 'مبارزة') {
        const target = message.mentions.users.first();
        if (!target || target.id === message.author.id) return message.reply('❌ منشن شخصاً لتتحداه وجهاً لوجه! مثال: `+مبارزة @user`');
        const user = getUser(message.author.id);
        user.coins += 90;
        return message.reply(`⚔️ **المبارزة الحماسية اشتعلت بين <@${message.author.id}> و <@${target.id}>!**\nبعد قتال بطولي، انتصرت وحصلت على **90 🪙**!`);
    }

    if (command === 'تخمين') {
        const secret = Math.floor(Math.random() * 20) + 1;
        const user = getUser(message.author.id);
        user.coins += 50;
        return message.reply(`🎯 الرقم السري كان **${secret}**! حصلت على **50 🪙** لمشاركتك بالتخمين.`);
    }

    if (command === 'اسئلة' || command === 'أسئلة') {
        const user = getUser(message.author.id);
        user.coins += 70; user.xp += 25;
        return message.reply(`🧠 إجابتك ذكية وسريعة للغاية! ربحت **70 🪙** و 25 XP ⭐.`);
    }

    if (command === 'اسرع' || command === 'تحدي_السرعة') {
        const user = getUser(message.author.id);
        user.coins += 80; user.xp += 30;
        return message.reply(`⚡ كنت أسرع شخص في كتابة الكلمة المطلوبة وفزت بـ **80 🪙** و 30 XP ⭐.`);
    }

    if (command === 'لغز') {
        const user = getUser(message.author.id);
        user.coins += 60;
        return message.reply(`🧩 **اللغز:** شيء أبيض من اللبن وأسود من الليل.. ما هو؟ ربحت **60 🪙** لحل اللغز!`);
    }

    if (command === 'حظك_اليوم') {
        const fortunes = ['حظك اليوم خارق وتستحق جائزة كبرى!', 'احذر من السرقة اليوم!', 'ستحصل على عملات مضاعفة قريباً!'];
        const user = getUser(message.author.id);
        user.coins += 40;
        return message.reply(`🔮 **طالع حظك اليوم:** ${fortunes[Math.floor(Math.random() * fortunes.length)]} (حصلت على 40 🪙).`);
    }

    if (command === 'يومي') {
        const user = getUser(message.author.id);
        const now = Date.now();
        if (user.lastDaily && now - user.lastDaily < 86400000) {
            return message.reply('⏳ لقد استلمت مكافأتك اليومية بالفعل، عد غداً!');
        }
        user.coins += 300;
        user.xp += 60;
        user.lastDaily = now;
        return message.reply('🎁 تم استلام **300 عملة 🪙** و 60 XP ⭐ بنجاح!');
    }

    if (command === 'بروفايل' || command === 'فلوسي') {
        const user = getUser(message.author.id);
        return message.reply(`💳 **الملف الشخصي لـ ${message.author.username}:**\n🪙 رصيدك الحالي: **${user.coins}** عملة\n⭐ نقاط الخبرة (XP): **${user.xp}**`);
    }
});

client.login(process.env.TOKEN);
