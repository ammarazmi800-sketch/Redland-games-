const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

let isSystemActive = true;

client.once('ready', () => {
    console.log(`✅ بوت Hellwood Security & Games اشتغل بنجاح: ${client.user.tag}`);
});

// --- نظام الترحيب بالأعضاء الجدد ---
client.on('guildMemberAdd', async (member) => {
    const welcomeChannelId = 'حط_ايدي_روم_الترحيب_هنا';
    const channel = member.guild.channels.cache.get(welcomeChannelId);
    if (!channel) return;

    const welcomeEmbed = new EmbedBuilder()
        .setColor('#2F3136')
        .setTitle('Welcome to Hellwood 🦇')
        .setDescription(`أهلاً بك يا <@${member.id}> في سيرفرنا! نورتنا.\nRead the rules and enjoy your stay.`)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: 'Hellwood Community' });

    channel.send({ content: `<@${member.id}>`, embeds: [welcomeEmbed] });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const prefix = '+';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // --- أمر إيقاف وتشغيل النظام ---
    if (command === 'إيقاف' || command === 'ايقاف') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ هذا الأمر للمشرفين فقط!');
        }

        isSystemActive = !isSystemActive;
        const statusMsg = isSystemActive ? '🟢 **تم تشغيل النظام والأمان بنجاح!**' : '🔴 **تم إيقاف نظام البوت مؤقتاً!**';
        return message.reply(statusMsg);
    }

    if (!isSystemActive) return;

    // ==========================================
    // 📜 قائمة المساعدة الاحترافية (+help)
    // ==========================================
    if (command === 'help' || command === 'اوامر' || command === 'مساعدة') {
        const helpEmbed = new EmbedBuilder()
            .setColor('#2F3136')
            .setTitle('🦇 **Hellwood Bot — قائمة الأوامر والألعاب الجماعية**')
            .setDescription('جميع الألعاب تدعم حتى **100+ لاعب** مع نظام انضمام زمني (60 ثانية):')
            .addFields(
                { name: '🛡️ **أوامر الإدارة والحماية**', value: '`+نفي @User` - حظر العضو\n`+ايقاف` - إيقاف/تشغيل البوت', inline: false },
                { name: '🎮 **الألعاب الجماعية الكبرى**', value: '`+سالفة` - لعبة برا السالفة\n`+كراسي` - الكراسي الموسيقية (أزرار تفاعلية)\n`+غميضة` - غميضة (اختيار مكان + بحث العجلة)\n`+مافيا` - لعبة المافيا السرية (أدوار بالخاص + تصويت)\n`+قنبلة` - تفكيك القنبلة الموقوتة\n`+روليت` - عجلة الحظ العشوائية\n`+اسرع` - تحدي السرعة في الكتابة\n`+مبارزة @User` - معركة فردية', inline: false }
            )
            .setFooter({ text: 'Hellwood Community' });

        return message.channel.send({ embeds: [helpEmbed] });
    }

    // --- نظام النفي (حظر العضو) ---
    if (command === 'نفي' || command === 'بان') {
        if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
            return message.reply('❌ لا تمتلك صلاحية لحظر الأعضاء!');
        }

        const target = message.mentions.members.first();
        if (!target) return message.reply('❌ منشن الشخص المراد نفيه! مثال: `+نفي @User`');

        try {
            await target.ban({ reason: `تم النفي بواسطة ${message.author.tag}` });
            const banEmbed = new EmbedBuilder()
                .setColor('#FF0000')
                .setTitle('⚖️ **حكم النفي (Hellwood Ban)**')
                .setDescription(`تم نفي وطرد العضو <@${target.id}> خارج أراضي Hellwood بنجاح!`);
            return message.channel.send({ embeds: [banEmbed] });
        } catch (err) {
            return message.reply('❌ لا يمكنني نفي هذا العضو.');
        }
    }

    // ==========================================
    // 🎡 لعبة الروليت العشوائية
    // ==========================================
    if (command === 'روليت' || command === 'عجلة') {
        await message.guild.members.fetch();
        const members = message.guild.members.cache.filter(m => !m.user.bot);
        if (members.size === 0) return message.reply('❌ لا توجد أعضاء كافيين!');

        const randomMember = members.random();
        const outcomes = [
            `💥 **جات عليك العجله يا <@${randomMember.id}>!** وانفجرت في وجهك!`,
            `🚀 **جات عليك العجله يا <@${randomMember.id}>!** وتم طردك عشوائياً!`,
            `🎯 **جات عليك العجله يا <@${randomMember.id}>!** حظك خارق وتضاعفت نقاطك!`
        ];

        const wheelEmbed = new EmbedBuilder()
            .setColor('#E74C3C')
            .setTitle('🎡 **عجلة الحظ العشوائية — Hellwood**')
            .setDescription(outcomes[Math.floor(Math.random() * outcomes.length)]);

        return message.channel.send({ embeds: [wheelEmbed] });
    }

    // ==========================================
    // 🤫 لعبة برا السالفة (تستوعب 100 لاعب - دقيقة انضمام)
    // ==========================================
    if (command === 'سالفة' || command === 'برا_السالفة') {
        const embed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('🤫 **لعبة برا السالفة — فتح باب الانضمام!**')
            .setDescription('امامكم **60 ثانية (دقيقة)** للانضمام للعبة عبر الضغط على الزر أدناه!');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('join_salfa').setLabel('انضم إلى السالفة 🎮').setStyle(ButtonStyle.Success)
        );

        const sentMsg = await message.channel.send({ embeds: [embed], components: [row] });
        const participants = new Set();
        const collector = sentMsg.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (i) => {
            if (participants.has(i.user.id)) {
                return i.reply({ content: '⚠️ أنت منضم مسبقاً في اللعبة!', ephemeral: true });
            }
            participants.add(i.user.id);
            await i.reply({ content: `✅ تم انضمامك بنجاح! إجمالي اللاعبين الآن: **${participants.size}**`, ephemeral: true });
        });

        collector.on('end', async () => {
            if (participants.size < 3) {
                return sentMsg.edit({ content: '❌ انتهى الوقت ولم يتفاعل العدد المطلوب (3 لاعبين كحد أدنى).', embeds: [], components: [] }).catch(() => {});
            }

            const playersArr = Array.from(participants);
            const outsiderId = playersArr[Math.floor(Math.random() * playersArr.length)];
            const secretWord = 'فالورانت (لعبة)';

            playersArr.forEach(async (userId) => {
                try {
                    const user = await client.users.fetch(userId);
                    if (userId === outsiderId) {
                        user.send('🤫 **أنت (برا السالفة)!** لا تملك الكلمة، حاول مجاراة النقاش ولا تكشف نفسك.');
                    } else {
                        user.send(`🔒 **كلمة السالفة لهذه الجولة هي:** \`${secretWord}\``);
                    }
                } catch (e) {}
            });

            const startEmbed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('🚀 **بدأت لعبة برا السالفة رسمياً!**')
                .setDescription(`عدد اللاعبين المشاركين: **${playersArr.size} لاعب**\nتم توزيع الكلمات والأدوار بالخاص. ابدأوا النقاش الآن!`);

            await sentMsg.edit({ embeds: [startEmbed], components: [] }).catch(() => {});
        });
    }

    // ==========================================
    // 🪑 لعبة الكراسي الموسيقية
    // ==========================================
    if (command === 'كراسي') {
        const embed = new EmbedBuilder()
            .setColor('#F1C40F')
            .setTitle('🪑 **لعبة الكراسي الموسيقية الكبرى!**')
            .setDescription('امامكم **60 ثانية (دقيقة)** لحجز مقعدك قبل انطلاق الموسيقى واستبعاد الخاسرين!');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('join_chairs').setLabel('احجز مقعدك الآن 🪑').setStyle(ButtonStyle.Primary)
        );

        const sentMsg = await message.channel.send({ embeds: [embed], components: [row] });
        const participants = new Set();
        const collector = sentMsg.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (i) => {
            if (participants.has(i.user.id)) {
                return i.reply({ content: '⚠️ أنت جالس مسبقاً!', ephemeral: true });
            }
            participants.add(i.user.id);
            await i.reply({ content: `✅ حجزت مقعدك بنجاح! إجمالي الحاضرين: **${participants.size} لاعب**`, ephemeral: true });
        });

        collector.on('end', async () => {
            const resultEmbed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('🛑 **انتهت الموسيقى! نتائج الكراسي:**')
                .setDescription(`إجمالي اللاعبين المتأهلين: **${participants.size} لاعب**\nتم إقصاء كل من لم يلحق المقعد بالوقت المحدد!`);

            await sentMsg.edit({ embeds: [resultEmbed], components: [] }).catch(() => {});
        });
    }

    // ==========================================
    // 🙈 لعبة الغميضة
    // ==========================================
    if (command === 'غميضة' || command === 'غبيضة') {
        await message.guild.members.fetch();
        const members = message.guild.members.cache.filter(m => !m.user.bot);
        const seeker = members.random();

        const embed = new EmbedBuilder()
            .setColor('#3498DB')
            .setTitle('🙈 **لعبة الغميضة الكبرى — Hellwood**')
            .setDescription(`🛑 **الباحث لهذه الجولة:** <@${seeker.id}>!\n⏳ أمامكم **60 ثانية** للاختباء باختيار المخبأ من القائمة أدناه:`);

        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('hide_place')
                .setPlaceholder('اختر مكان اختبائك السري...')
                .addOptions([
                    { label: 'تحت السرير', value: 'bed', emoji: '🛏️' },
                    { label: 'داخل الخزانة', value: 'closet', emoji: '🚪' },
                    { label: 'خلف الباب', value: 'door', emoji: '🪵' },
                    { label: 'فوق السطح', value: 'roof', emoji: '🏠' }
                ])
        );

        const sentMsg = await message.channel.send({ embeds: [embed], components: [row] });
        const collector = sentMsg.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (i) => {
            if (i.user.id === seeker.id) return i.reply({ content: '❌ أنت الباحث، لا تختبئ!', ephemeral: true });
            await i.reply({ content: `✅ اختبأت في (${i.values[0]}) بنجاح!`, ephemeral: true });
        });
    }

    // ==========================================
    // 🕵️‍♂️ لعبة المافيا السرية
    // ==========================================
    if (command === 'مافيا') {
        const embed = new EmbedBuilder()
            .setColor('#2C3E50')
            .setTitle('🕵️‍♂️ **لعبة المافيا السرية — فتح باب التسجيل!**')
            .setDescription('امامكم **60 ثانية (دقيقة)** للانضمام لجولة المافيا وتوزيع الأدوار سراَ بالخاص!');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('join_mafia').setLabel('انضم إلى المافيا 🕵️‍♂️').setStyle(ButtonStyle.Secondary)
        );

        const sentMsg = await message.channel.send({ embeds: [embed], components: [row] });
        const participants = new Set();
        const collector = sentMsg.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (i) => {
            participants.add(i.user.id);
            await i.reply({ content: '✅ انضممت للعبة المافيا بنجاح!', ephemeral: true });
        });

        collector.on('end', async () => {
            if (participants.size < 3) {
                return sentMsg.edit({ content: '❌ لم يكتمل العدد المطلوب للمافيا.', embeds: [], components: [] }).catch(() => {});
            }

            const playersArr = Array.from(participants);
            const mafiaId = playersArr[Math.floor(Math.random() * playersArr.length)];

            try {
                const mafiaUser = await client.users.fetch(mafiaId);
                mafiaUser.send('🕵️‍♂️ **أنت المافيا الخبيث في هذه الجولة!** حاول ألا تكشف نفسك.');
            } catch (e) {}

            const startEmbed = new EmbedBuilder()
                .setColor('#2C3E50')
                .setTitle('🕵️‍♂️ **بدأت لعبة المافيا!**')
                .setDescription('تم توزيع الأدوار سرا بالخاص. ابدأوا النقاش وصوتوا عبر:\n`+تصويت @User`');

            await sentMsg.edit({ embeds: [startEmbed], components: [] }).catch(() => {});
        });
    }

    if (command === 'تصويت') {
        const target = message.mentions.users.first();
        if (!target) return message.reply('❌ منشن الشخص المشتبه به! مثال: `+تصويت @User`');
        return message.channel.send(`🗳️ تم تسجيل صوت ضد: <@${target.id}>. استمروا بالنقاش!`);
    }

    // ==========================================
    // 💣 لعبة القنبلة الجماعية
    // ==========================================
    if (command === 'قنبلة') {
        const embed = new EmbedBuilder()
            .setColor('#E67E22')
            .setTitle('💣 **تم زرع قنبلة موقوتة في السيرفر!**')
            .setDescription('أمام الفريق **60 ثانية** لاختيار السلك الصحيح وإنقاذ الجميع من الانفجار!');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('blue_wire').setLabel('السلك الأزرق 🔹').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('red_wire').setLabel('السلك الأحمر 🔴').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId('green_wire').setLabel('السلك الأخضر 🟩').setStyle(ButtonStyle.Success)
        );

        const sentMsg = await message.channel.send({ embeds: [embed], components: [row] });
        const correctWire = ['blue_wire', 'red_wire', 'green_wire'][Math.floor(Math.random() * 3)];
        const collector = sentMsg.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async (i) => {
            if (i.customId === correctWire) {
                await i.reply({ content: `🎉 **بطل يا <@${i.user.id}>!** قطعت السلك الصحيح ونزعت فتيل القنبلة بنجاح!`, ephemeral: false });
            } else {
                await i.reply({ content: `💥 **بوووم يا <@${i.user.id}>!** اخترت السلك الخاطئ وانفجرت القنبلة!`, ephemeral: false });
            }
            collector.stop();
        });
    }

    // ==========================================
    // ⚡ تحدي السرعة
    // ==========================================
    if (command === 'اسرع' || command === 'تحدي_السرعة') {
        const words = ['هيلوود', 'ديسكورد', 'برمجة', 'سرعة', 'تحدي', 'رفاق'];
        const targetWord = words[Math.floor(Math.random() * words.length)];

        await message.channel.send(`⚡ **تحدي السرعة انطلق!** أسرع شخص يكتب هذه الكلمة يفوز:\n\n👉 **\`${targetWord}\`**`);

        const filter = (m) => m.content === targetWord && !m.author.bot;
        const collector = message.channel.createMessageCollector({ filter, time: 20000, max: 1 });

        collector.on('collect', (m) => {
            m.reply(`🏆 **كفو يا <@${m.author.id}>!** كنت الأسرع وفزت بالتحدي!`);
        });

        collector.on('end', (collected) => {
            if (collected.size === 0) {
                message.channel.send('⌛ انتهى الوقت! لم يكتب أحد الكلمة بالسرعة المطلوبة.');
            }
        });
    }

    // ==========================================
    // ⚔️ لعبة المبارزة
    // ==========================================
    if (command === 'مبارزة') {
        const target = message.mentions.users.first();
        if (!target || target.id === message.author.id) {
            return message.reply('❌ منشن شخصاً لتتحداه! مثال: `+مبارزة @User`');
        }

        const winner = Math.random() < 0.5 ? message.author : target;
        const duelEmbed = new EmbedBuilder()
            .setColor('#E74C3C')
            .setTitle('⚔️ **حلبة المبارزة الكبرى — Hellwood**')
            .setDescription(`تقاتل كل من <@${message.author.id}> و <@${target.id}> بشراسة...\n\n🏆 **وانتصر في المعركة:** <@${winner.id}> بجدارة واستحقاق!`);

        return message.channel.send({ embeds: [duelEmbed] });
    }
});

client.login(process.env.TOKEN);
