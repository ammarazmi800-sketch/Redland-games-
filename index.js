const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const playerData = new Map(); // نظام النقاط والمتاجر والأسلحة

client.once('ready', () => {
    console.log(`✅ بوت Hellwood 40 Games & Store اشتغل بنجاح: ${client.user.tag}`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const prefix = '+';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // ==========================================
    // 📜 قائمة الألعاب الشاملة الـ 40 (Help)
    // ==========================================
    if (command === 'help' || command === 'اوامر' || command === 'ألعاب' || command === 'مساعدة') {
        const embed1 = new EmbedBuilder()
            .setColor('#2F3136')
            .setTitle('🦇 **Hellwood — قائمة الـ 40 لعبة الكبرى (الجزء 1)**')
            .setDescription('قائمة الألعاب الجماعية والروليت والمتجر بالكامل:')
            .addFields(
                { name: '🎡 **ألعاب الروليت والحظ (1-10)**', value: '`+روليت` - روليت عالي مع زر انضمام\n`+روليت_روسي` - الروليت الروسي المرعب\n`+عجلة_الحظ` - عجلة الجوائز السريعة\n`+صندوق_مفاجآت` - فتح صناديق الحظ\n`+حجر_صخر` - صخرة الحظ العشوائية\n`+يانصيب` - سحب اليانصيب الكبرى\n`+تحديد_المصير` - اختيار عشوائي قاسي\n`+لعبة_القرعة` - قرعة سريعة للاعبين\n`+سحب_عشوائي` - اختيار فائز فوري\n`+مقامرة` - تحدي النقاط والحظ', inline: false },
                { name: '🕵️‍♂️ **ألعاب الذكاء والأدوار (11-20)**', value: '`+سالفة` - برا السالفة الشهيرة بالخاص\n`+مافيا` - لعبة المافيا السرية والتصويت\n`+المحقق` - كشف الجريمة والقاتل\n`+الجاسوس` - البحث عن الجاسوس الخفي\n`+الصراحة` - أسئلة جريئة تفاعلية\n`+من_أنا` - تخمين الشخصيات\n`+القاتل` - لعبة البقاء والهروب\n`+لغز_اليوم` - فوازير ذكاء جماعية\n`+أحزر_الكلمة` - فك الشفرات\n`+تخمین_الرقم` - تحدي الأرقام الذكية', inline: false }
            );

        const embed2 = new EmbedBuilder()
            .setColor('#2F3136')
            .setTitle('🦇 **Hellwood — قائمة الـ 40 لعبة الكبرى (الجزء 2)**')
            .addFields(
                { name: '⚡ **ألعاب السرعة والتفاعل (21-30)**', value: '`+اسرع` - أسرع شخص يكتب الكلمة\n`+كراسي` - الكراسي الموسيقية بالأزرار\n`+قنبلة` - تفكيك القنبلة الموقوتة\n`+ضغط_سرعة` - تحدي الضغطات السريعة\n`+سباق_الحروف` - كتابة الحروف المبعثرة\n`+تحدي_الكتابة` - اختبار سرعة الكتابة\n`+الاشارة_الحمراء` - إيقاف الحركة\n`+ردة_فعل` - اختبار سرعة البديهة\n`+حرب_الأزرار` - السيطرة على الأزرار\n`+سرعة_البرق` - تحدي المللي ثانية', inline: false },
                { name: '⚔️ **ألعاب المعارك والمتجر (31-40)**', value: '`+مبارزة @User` - معركة 1 ضد 1\n`+متجر` - متجر الأسلحة والقدرات (قنبلة، نووي، صاروخ...)\n`+حرب_العصابات` - معارك السيرفر الجماعية\n`+حصار_القلعة` - الدفاع والهجوم\n`+تحدي_الزومبي` - النجاة من الموت\n`+حلبة_الموت` - آخر باقي يفوز\n`+معركة_الفضاء` - حرب النجوم\n`+تحدي_السيوف` - مبارزة تاريخية\n`+صائد_الجوائز` - مهام ومكافآت\n`+ترتيب_البطولة` - لوحة شرف المتصدرين', inline: false }
            );

        await message.channel.send({ embeds: [embed1] });
        return message.channel.send({ embeds: [embed2] });
    }

    // ==========================================
    // 🎡 1. لعبة الروليت الاحترافية (بزر انضمام وخروج)
    // ==========================================
    if (command === 'روليت' || command === 'عجلة' || command === 'عجلة_الحظ') {
        const embed = new EmbedBuilder()
            .setColor('#0099FF')
            .setTitle('🎡 **روليت عالي — Hellwood Games**')
            .setDescription('⏱️ تبدأ خلال **40 ثانية**!\n\nاضغط على زر الانضمام الأخضر لتسجيل اسمك في قائمة اللاعبين:')
            .setFooter({ text: 'By [ Hellwood System ]' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('join_roulette').setLabel('🟢 انضمام').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('leave_roulette').setLabel('🔴 - خروج').setStyle(ButtonStyle.Danger)
        );

        const sentMsg = await message.channel.send({ embeds: [embed], components: [row] });
        const players = new Set();
        const collector = sentMsg.createMessageComponentCollector({ time: 40000 });

        collector.on('collect', async (i) => {
            if (i.customId === 'join_roulette') {
                players.add(i.user.id);
                await i.reply({ content: `✅ تم انضمامك بنجاح! عدد اللاعبين: **(${players.size}/1200)**`, ephemeral: true });
            } else if (i.customId === 'leave_roulette') {
                players.delete(i.user.id);
                await i.reply({ content: '❌ تم إزالتك من قائمة اللاعبين.', ephemeral: true });
            }
        });

        collector.on('end', async () => {
            if (players.size === 0) return sentMsg.edit({ content: '❌ انتهى الوقت ولم ينضم أحد.', embeds: [], components: [] }).catch(() => {});
            const arr = Array.from(players);
            const winner = arr[Math.floor(Math.random() * arr.length)];
            const resEmbed = new EmbedBuilder().setColor('#E74C3C').setTitle('🎡 **نتيجة الروليت**').setDescription(`💥 **وقع الاختيار على:** <@${winner}>!`);
            await sentMsg.edit({ embeds: [resEmbed], components: [] }).catch(() => {});
        });
    }

    // ==========================================
    // 🤫 2. لعبة برا السالفة
    // ==========================================
    if (command === 'سالفة' || command === 'برا_السالفة') {
        const embed = new EmbedBuilder().setColor('#9B59B6').setTitle('🤫 **لعبة برا السالفة — انضمام (60 ثانية)**').setDescription('اضغط للانضمام للجولة!');
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('join_salfa').setLabel('انضم إلى السالفة 🎮').setStyle(ButtonStyle.Success));
        const sentMsg = await message.channel.send({ embeds: [embed], components: [row] });
        const participants = new Set();
        const collector = sentMsg.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (i) => {
            participants.add(i.user.id);
            await i.reply({ content: '✅ انضممت بنجاح!', ephemeral: true });
        });

        collector.on('end', async () => {
            if (participants.size < 3) return sentMsg.edit({ content: '❌ لم يكتمل العدد (3 لاعبين كحد أدنى).', embeds: [], components: [] }).catch(() => {});
            const arr = Array.from(participants);
            const outsider = arr[Math.floor(Math.random() * arr.length)];
            arr.forEach(async (id) => {
                try {
                    const u = await client.users.fetch(id);
                    if (id === outsider) u.send('🤫 **أنت (برا السالفة)!** جاري مجاراة النقاش بلا كلمة.');
                    else u.send('🔒 **كلمة السالفة هي:** `فالورانت`');
                } catch(e){}
            });
            await sentMsg.edit({ content: `🚀 بدأت اللعبة بـ ${arr.size} لاعب! تم توزيع الكلمات بالخاص.`, embeds: [], components: [] }).catch(() => {});
        });
    }

    // ==========================================
    // 🪑 3. الكراسي الموسيقية
    // ==========================================
    if (command === 'كراسي') {
        const embed = new EmbedBuilder().setColor('#F1C40F').setTitle('🪑 **الكراسي الموسيقية — 60 ثانية**').setDescription('احجز مقعدك السريع!');
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('chair_btn').setLabel('حجز مقعد 🪑').setStyle(ButtonStyle.Primary));
        const sentMsg = await message.channel.send({ embeds: [embed], components: [row] });
        const participants = new Set();
        const collector = sentMsg.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (i) => {
            participants.add(i.user.id);
            await i.reply({ content: '✅ حجزت مقعدك!', ephemeral: true });
        });

        collector.on('end', async () => {
            await sentMsg.edit({ content: `🛑 انتهت الموسيقى! عدد الناجين بالمقاعد: **${participants.size} لاعب**`, embeds: [], components: [] }).catch(() => {});
        });
    }

    // ==========================================
    // 💣 4. تفكيك القنبلة
    // ==========================================
    if (command === 'قنبلة') {
        const embed = new EmbedBuilder().setColor('#E67E22').setTitle('💣 **انفجرت الأزمة! زرعت قنبلة موقوتة**').setDescription('اختر السلك الصحيح خلال 30 ثانية لإنقاذ الفريق!');
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('blue').setLabel('السلك الأزرق 🔹').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('red').setLabel('السلك الأحمر 🔴').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('green').setLabel('السلك الأخضر 🟩').setStyle(ButtonStyle.Success)
        );
        const sentMsg = await message.channel.send({ embeds: [embed], components: [row] });
        const correct = ['blue', 'red', 'green'][Math.floor(Math.random() * 3)];
        const collector = sentMsg.createMessageComponentCollector({ time: 30000 });

        collector.on('collect', async (i) => {
            if (i.customId === correct) {
                await i.reply({ content: `🎉 **كفو يا <@${i.user.id}>!** قطعت السلك الصحيح وأبطلت القنبلة!`, ephemeral: false });
            } else {
                await i.reply({ content: `💥 **بوووم يا <@${i.user.id}>!** اخترت السلك الخاطئ وانفجرت!`, ephemeral: false });
            }
            collector.stop();
        });
    }

    // ==========================================
    // ⚡ 5. تحدي السرعة
    // ==========================================
    if (command === 'اسرع' || command === 'تحدي_الكتابة') {
        const words = ['هيلوود', 'ديسكورد', 'برمجة', 'سرعة', 'فالورانت', 'روبلوکس'];
        const target = words[Math.floor(Math.random() * words.length)];
        await message.channel.send(`⚡ **أسرع شخص يكتب الكلمة التالية يفوز:**\n\n👉 **\`${target}\`**`);
        const filter = (m) => m.content === target && !m.author.bot;
        const collector = message.channel.createMessageCollector({ filter, time: 20000, max: 1 });

        collector.on('collect', (m) => {
            m.reply(`🏆 **مبروك!** كنت الأسرع وتصدرت المركز الأول!`);
        });
    }

    // ==========================================
    // ⚔️ 6. متجر الأسلحة والقدرات الاحترافي
    // ==========================================
    if (command === 'متجر' || command === 'أسلحة' || command === 'قدرات') {
        const userStat = playerData.get(message.author.id) || { points: 2000, inventory: [] };
        const storeEmbed = new EmbedBuilder()
            .setColor('#2C3E50')
            .setTitle('⚔️ **الأجهزة والقدرات — متجر Hellwood**')
            .setDescription(`💰 **رصيدك الحالي:** \`${userStat.points} نقطة\`\n\nاختر السلاح أو القدرة للشراء:`)
            .addFields(
                { name: '💣 قنبلة', value: 'السعر: 500 نقطة', inline: true },
                { name: '🍷 صاروخ', value: 'السعر: 1,500 نقطة', inline: true },
                { name: '🤫 نووي', value: 'السعر: 2,500 نقطة', inline: true },
                { name: '🕳️ ثقب أسود', value: 'السعر: 5,000 نقطة', inline: true },
                { name: '🔴 الجنى الأحمر', value: 'السعر: 10,000 نقطة', inline: true }
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('buy_bomb').setLabel('شراء قنبلة 💣').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('buy_nuke').setLabel('شراء نووي 🤫').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('my_inv').setLabel('📦 مخزوني').setStyle(ButtonStyle.Secondary)
        );

        const sentMsg = await message.channel.send({ embeds: [storeEmbed], components: [row] });
        const collector = sentMsg.createMessageComponentCollector({ time: 30000 });

        collector.on('collect', async (i) => {
            if (i.user.id !== message.author.id) return i.reply({ content: '❌ هذه القائمة ليست لك!', ephemeral: true });
            let data = playerData.get(i.user.id) || { points: 2000, inventory: [] };

            if (i.customId === 'buy_bomb' && data.points >= 500) {
                data.points -= 500; data.inventory.push('قنبلة 💣');
                playerData.set(i.user.id, data);
                await i.reply({ content: '✅ تم شراء القنبلة بنجاح!', ephemeral: true });
            } else if (i.customId === 'buy_nuke' && data.points >= 2500) {
                data.points -= 2500; data.inventory.push('نووي 🤫');
                playerData.set(i.user.id, data);
                await i.reply({ content: '✅ تم شراء النووي بنجاح!', ephemeral: true });
            } else if (i.customId === 'my_inv') {
                const inv = data.inventory.length ? data.inventory.join(', ') : 'فارغ';
                await i.reply({ content: `📦 مخزونك: ${inv} | نقاطك: ${data.points}`, ephemeral: true });
            } else {
                await i.reply({ content: '❌ نقاطك غير كافية!', ephemeral: true });
            }
        });
    }

    // ==========================================
    // ⚔️ 7. لعبة المبارزة الفردية
    // ==========================================
    if (command === 'مبارزة') {
        const target = message.mentions.users.first();
        if (!target || target.id === message.author.id) return message.reply('❌ منشن شخصاً لتتحداه! مثال: `+مبارزة @User`');
        const winner = Math.random() < 0.5 ? message.author : target;
        const duelEmbed = new EmbedBuilder()
            .setColor('#E74C3C')
            .setTitle('⚔️ **حلبة المبارزة — Hellwood**')
            .setDescription(`تقاتل <@${message.author.id}> و <@${target.id}> بشراسة...\n\n🏆 **وانتصر في المعركة:** <@${winner.id}> بجدارة!`);
        return message.channel.send({ embeds: [duelEmbed] });
    }
});

client.login(process.env.TOKEN);
