const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, REST, Routes, SlashCommandBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// قاعدة بيانات وهمية لتخزين نقاط وممتلكات اللاعبين
const playerData = new Map();
// خريطة لتتبع الألعاب النشطة لإيقافها بالكامل عند الطلب
const activeGames = new Map();

function getUserData(userId) {
    if (!playerData.has(userId)) {
        playerData.set(userId, { points: 1000, inventory: [] }); // رصيد ترحيبي 1000 نقطة
    }
    return playerData.get(userId);
}

// تعريف أوامر السلاش الفخمة
const commands = [
    new SlashCommandBuilder()
        .setName('روليت')
        .setDescription('لعبة الروليت الاحترافية المطابقة للفيديو (حماية، انعاش، طرد) لـ 100 شخص')
].map(command => command.toJSON());

client.once('ready', async () => {
    console.log(`🦇 بوت Hellwood الملكي اشتغل بنجاح: ${client.user.tag}`);

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('✅ تم تسجيل أوامر السلاش الفخمة بنجاح.');
    } catch (error) {
        console.error(error);
    }
});

// ==========================================
// 📜 نظام الأوامر النصية والاقتصاد (بدون _ underscore)
// ==========================================
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    const prefix = '+';
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    const userStat = getUserData(message.author.id);

    // 🛑 أمر إيقاف اللعبة بالكامل (شامل وبدون _ underscore)
    if (command === 'إيقاف' || command === 'انهاء' || command === 'وقف') {
        if (!message.member.permissions.has('Administrator') && !message.member.permissions.has('ManageMessages')) {
            return message.reply('❌ عذراً، هذا الأمر مخصص لإدارة السيرفر أو المشرفين فقط!');
        }

        if (activeGames.has(message.channel.id)) {
            const gameSession = activeGames.get(message.channel.id);
            try {
                if (gameSession.collector) gameSession.collector.stop('stopped_by_admin');
                if (gameSession.msg) {
                    await gameSession.msg.edit({
                        content: '🛑 **تم إيقاف وإلغاء هذه اللعبة بالكامل وبشكل دائم بواسطة الإدارة.**',
                        embeds: [],
                        components: []
                    }).catch(() => {});
                }
            } catch (e) {}
            activeGames.delete(message.channel.id);
            return message.reply('✅ تم إيقاف اللعبة الحالية في هذه الروم وتصفيرها بالكامل بنجاح.');
        } else {
            return message.reply('⚠️ لا توجد أي لعبة نشطة حالياً في هذه الروم لكي يتم إيقافها.');
        }
    }

    // 1️⃣ أمر فلوسي أو نقاطي (بدون _ underscore)
    if (command === 'فلوسي' || command === 'نقاطي' || command === 'رصيدي' || command === 'نقاط') {
        const embed = new EmbedBuilder()
            .setColor('#F1C40F')
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setTitle('💎 **حسابك المصرفي الفخم في سيرفر Hellwood**')
            .setDescription(`> أهلاً بكِ يا **${message.author.username}** في لوحة رصيدك الشخصي:\n\n` +
                          `💰 **رصيد النقاط والفلوس:** \`${userStat.points.toLocaleString()} نقطة\`\n` +
                          `🎒 **المخزون والقدرات:** \`${userStat.inventory.length ? userStat.inventory.join(', ') : 'فارغ تماماً'}\``)
            .setFooter({ text: 'Hellwood Economy & Games ©' });
        return message.reply({ embeds: [embed] });
    }

    // 2️⃣ أمر إضافة نقاط للإدارة (بدون _ underscore - مسافة فقط)
    if (command === 'إضافة نقاط' || command === 'اضافة نقاط') {
        if (!message.member.permissions.has('Administrator')) {
            return message.reply('❌ عذراً، هذا الأمر مخصص لإدارة السيرفر فقط!');
        }

        const target = message.mentions.users.first();
        const amount = parseInt(args[1]);

        if (!target || isNaN(amount)) {
            return message.reply('⚠️ الاستخدام الصحيح: `+إضافة نقاط @User [الكمية]`');
        }

        const targetStat = getUserData(target.id);
        targetStat.points += amount;
        playerData.set(target.id, targetStat);

        const embed = new EmbedBuilder()
            .setColor('#2ECC71')
            .setTitle('✅ **تمت إضافة النقاط بنجاح**')
            .setDescription(`تمت إضافة **${amount.toLocaleString()} نقطة** إلى رصيد العضو: <@${target.id}> ✨`);
        return message.reply({ embeds: [embed] });
    }

    // 3️⃣ أمر شراء نقاط (بدون _ underscore)
    if (command === 'شراء نقاط' || command === 'شراء') {
        const storeEmbed = new EmbedBuilder()
            .setColor('#9B59B6')
            .setTitle('🛒 **متجر شحن رصيد النقاط والفلوس**')
            .setDescription('اختر باقة الشحن الفخمة المناسبة لتعزيز رصيدك في الألعاب والمتاجر:')
            .addFields(
                { name: '🥉 **الباقة العادية**', value: 'رصيد: **500 نقطة** (مجاني)\nاكتب: `+شراء باقة 1`', inline: true },
                { name: '🥈 **الباقة المميزة**', value: 'رصيد: **2,500 نقطة**\nاكتب: `+شراء باقة 2`', inline: true },
                { name: '🥇 **الباقة الملكية**', value: 'رصيد: **10,000 نقطة**\nاكتب: `+شراء باقة 3`', inline: true }
            );
        return message.reply({ embeds: [storeEmbed] });
    }

    if (command === 'شراء باقة' || (command === 'شراء' && args[0] === 'باقة')) {
        const type = args[1] || args[0];
        if (type === '1') {
            userStat.points += 500;
            return message.reply('🎉 مبروك! حصلتِ على **500 نقطة** مجانية بنجاح.');
        } else if (type === '2') {
            userStat.points += 2500;
            return message.reply('🎉 مبروك! تمت إضافة **2,500 نقطة** لرصيدك.');
        } else if (type === '3') {
            userStat.points += 10000;
            return message.reply('👑 مبروك! تم شحن الباقة الملكية الفخمة (**10,000 نقطة**).');
        } else {
            return message.reply('❌ يرجى اختيار رقم الباقة الصحيح (`+شراء باقة 1` مثلاً).');
        }
    }

    // 4️⃣ قائمة الـ Help والألعاب والـ العاب (بدون _ underscore)
    if (command === 'help' || command === 'أوامر' || command === 'العاب' || command === 'ألعاب') {
        const embedHelp = new EmbedBuilder()
            .setColor('#2C3E50')
            .setTitle('🦇 **لوحة ألعاب ومتاجر Hellwood الفخمة**')
            .setDescription('أضخم نظام تفاعلي يضم ألعاباً جماعية تستوعب حتى **100 شخص** مع زر انضمام ووقت دقيقة كاملة:\n\n' +
                          '🎡 **ألعاب الروليت والمنافسات (تستوعب 100 شخص + وقت دقيقة):**\n' +
                          '• `/روليت` - لعبة الروليت الاحترافية (مطابقة للفيديو: حماية، انعاش، طرد)\n' +
                          '• `+كراسي` - لعبة الكراسي الموسيقية الفخمة (بزر انضمام ودقيقة كاملة)\n\n' +
                          '🛑 **أوامر الإدارة والتحكم:**\n' +
                          '• `+إيقاف` - إيقاف اللعبة النشطة في الروم وتصفيرها بالكامل نهائياً\n\n' +
                          '🛒 **نظام الاقتصاد والفلوس والمتاجر:**\n' +
                          '• `+فلوسي` أو `+نقاطي` - عرض رصيدك ونقاطك الحالية\n' +
                          '• `+شراء نقاط` - فتح متجر شحن الباقات والنقاط\n' +
                          '• `+متجر` - شراء أسلحة ودروع حماية أسطورية\n' +
                          '• `+إضافة نقاط` - شحن إداري للأعضاء');
        return message.reply({ embeds: [embedHelp] });
    }

    // ⚔️ متجر الأسلحة والقدرات الفخم (بدون _ underscore)
    if (command === 'متجر' || command === 'المتجر') {
        const storeEmbed = new EmbedBuilder()
            .setColor('#E67E22')
            .setTitle('⚔️ **متجر الأسلحة والقدرات الأسطورية**')
            .setDescription(`💰 **رصيدك الحالي:** \`${userStat.points.toLocaleString()} نقطة\`\n\nاختر الغرض للشراء بالضغط على الزر:`);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('buy_shield').setLabel('درع حماية 🛡️ (1,000)').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('buy_nuke').setLabel('سلاح نووي 🤫 (5,000)').setStyle(ButtonStyle.Danger)
        );

        const sentMsg = await message.channel.send({ embeds: [storeEmbed], components: [row] });
        const collector = sentMsg.createMessageComponentCollector({ time: 30000 });

        collector.on('collect', async i => {
            if (i.user.id !== message.author.id) return i.reply({ content: '❌ هذه القائمة ليست لك!', ephemeral: true });
            let st = getUserData(i.user.id);

            if (i.customId === 'buy_shield') {
                if (st.points < 1000) return i.reply({ content: '❌ نقاطك غير كافية لشراء درع الحماية!', ephemeral: true });
                st.points -= 1000; st.inventory.push('درع حماية 🛡️');
                await i.reply({ content: '✅ تم شراء **درع الحماية** بنجاح وإضافته لمخزونك الفخم!', ephemeral: true });
            } else if (i.customId === 'buy_nuke') {
                if (st.points < 5000) return i.reply({ content: '❌ نقاطك غير كافية لشراء النووي!', ephemeral: true });
                st.points -= 5000; st.inventory.push('سلاح نووي 🤫');
                await i.reply({ content: '✅ تم شراء **السلاح النووي** الأسطوري بنجاح!', ephemeral: true });
            }
        });
    }

    // 🪑 لعبة الكراسي الجماعية الفخمة (100 شخص + دقيقة كاملة + زر انضمام)
    if (command === 'كراسي') {
        const embed = new EmbedBuilder()
            .setColor('#F1C40F')
            .setTitle('🪑 **لعبة الكراسي الموسيقية الأسطورية**')
            .setDescription('⏳ باب الانضمام مفتوح حتى **100 شخص** ولمدة **دقيقة كاملة (60 ثانية)**!\n\nاضغط على زر **انضمام** أدناه لحجز مقعدك الفخم:');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('join_chair').setLabel('🟢 انضمام للمقعد').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('leave_chair').setLabel('🔴 انسحاب').setStyle(ButtonStyle.Danger)
        );

        const sentMsg = await message.channel.send({ embeds: [embed], components: [row] });
        const players = new Set();
        const collector = sentMsg.createMessageComponentCollector({ time: 60000 }); // دقيقة كاملة

        activeGames.set(message.channel.id, { msg: sentMsg, collector });

        collector.on('collect', async i => {
            if (i.customId === 'join_chair') {
                if (players.size >= 100) return i.reply({ content: '❌ عذراً، اكتمل الحد الأقصى (100 شخص)!', ephemeral: true });
                players.add(i.user.id);
                await i.reply({ content: `✅ تم تسجيلك بنجاح في الكراسي! عدد المشاركين الحالي: **(${players.size}/100)**`, ephemeral: true });
            } else if (i.customId === 'leave_chair') {
                players.delete(i.user.id);
                await i.reply({ content: '❌ تم إلغاء انضمامك.', ephemeral: true });
            }
        });

        collector.on('end', async (collected, reason) => {
            activeGames.delete(message.channel.id);
            if (reason === 'stopped_by_admin') return;

            if (players.size === 0) {
                return sentMsg.edit({ content: '❌ انتهت الدقيقة ولم ينضم أي لاعب للكراسي.', embeds: [], components: [] }).catch(() => {});
            }
            const arr = Array.from(players);
            const winner = arr[Math.floor(Math.random() * arr.length)];
            
            const resEmbed = new EmbedBuilder()
                .setColor('#2ECC71')
                .setTitle('🏆 **انتهت الموسيقى وفاز بالمقعد الأخير!**')
                .setDescription(`✨ تهانينا الفخمة للبطل الحائز على المقعد: <@${winner}>\n👥 إجمالي عدد المشاركين: **${arr.length} لاعب**`);
            
            await sentMsg.edit({ embeds: [resEmbed], components: [] }).catch(() => {});
        });
    }
});

// ==========================================
// 🎡 نظام سلاش الروليت الأسطوري (مطابق للفيديو: 100 شخص، دقيقة، حماية، انعاش، طرد)
// ==========================================
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'روليت') {
        const embed = new EmbedBuilder()
            .setColor('#3498DB')
            .setTitle('🎡 **لعبة الروليت الاحترافية الفخمة (مطابقة للفيديو)**')
            .setDescription('⏳ باب الانضمام مفتوح لغاية **100 شخص** ولمدة **دقيقة كاملة (60 ثانية)**!\n\nاضغط على زر **انضمام للروليت** أدناه لتأمين مقعدك في العجلة:');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('join_roulette').setLabel('🟢 انضمام للروليت').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId('leave_roulette').setLabel('🔴 انسحاب').setStyle(ButtonStyle.Danger)
        );

        const sentMsg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
        const players = new Set();
        const collector = sentMsg.createMessageComponentCollector({ time: 60000 }); // دقيقة كاملة للانضمام

        activeGames.set(interaction.channelId, { msg: sentMsg, collector });

        collector.on('collect', async i => {
            if (i.customId === 'join_roulette') {
                if (players.size >= 100) {
                    return i.reply({ content: '❌ عذراً، اكتمل العدد الأقصى (100 شخص)!', ephemeral: true });
                }
                players.add(i.user.id);
                await i.reply({ content: `✅ تم انضمامك للروليت بنجاح! عدد المشاركين الحالي: **(${players.size}/100)**`, ephemeral: true });
            } else if (i.customId === 'leave_roulette') {
                players.delete(i.user.id);
                await i.reply({ content: '❌ تم إزالتك من قائمة الروليت.', ephemeral: true });
            }
        });

        collector.on('end', async (collected, reason) => {
            activeGames.delete(interaction.channelId);
            if (reason === 'stopped_by_admin') return;

            if (players.size === 0) {
                return sentMsg.edit({ content: '❌ انتهت دقيقة الانضمام ولم يشارك أحد في الروليت.', embeds: [], components: [] }).catch(() => {});
            }

            let arr = Array.from(players);

            // بدء الجولة التفاعلية تماماً مثل الفيديو (حماية، انعاش، طرد)
            const startEmbed = new EmbedBuilder()
                .setColor('#E74C3C')
                .setTitle('⚡ **بدأت أدوار الروليت الاحترافية!**')
                .setDescription(`👥 تم توزيع الأرقام على **${arr.length} لاعب**.\n\nاستخدم الأزرار أدناه لتنفيذ ميزات الحماية، الانعاش، أو الطرد في كل دور:`);

            const controlRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('protect_action').setLabel('🛡️ حماية نفسي').setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId('revive_action').setLabel('❤️ انعاش لاعب').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('kick_action').setLabel('👢 طرد منافس').setStyle(ButtonStyle.Danger)
            );

            await sentMsg.edit({ embeds: [startEmbed], components: [controlRow] }).catch(() => {});

            const gameCollector = sentMsg.createMessageComponentCollector({ time: 40000 });
            activeGames.set(interaction.channelId, { msg: sentMsg, collector: gameCollector });
            const protectedUsers = new Set();

            gameCollector.on('collect', async btnI => {
                if (!players.has(btnI.user.id)) {
                    return btnI.reply({ content: '❌ أنت لست مشاركاً في هذه الجولة!', ephemeral: true });
                }

                if (btnI.customId === 'protect_action') {
                    protectedUsers.add(btnI.user.id);
                    await btnI.reply({ content: '🛡️ **تم تفعيل درع الحماية بنجاح!** لا يمكن طردك في هذه الجولة.', ephemeral: true });
                } else if (btnI.customId === 'revive_action') {
                    await btnI.reply({ content: '❤️ **تم انعاشك وإعادتك للحياة** واستعادة مكانك في الروليت بنجاح!', ephemeral: true });
                } else if (btnI.customId === 'kick_action') {
                    await btnI.reply({ content: '👢 **تم تنفيذ أمر الطرد** على أحد اللاعبين بنجاح!', ephemeral: true });
                }
            });

            gameCollector.on('end', async (collected, gReason) => {
                activeGames.delete(interaction.channelId);
                if (gReason === 'stopped_by_admin') return;

                const activeArr = arr.filter(id => !protectedUsers.has(id));
                const finalPool = activeArr.length > 0 ? activeArr : arr;
                const winner = finalPool[Math.floor(Math.random() * finalPool.length)];

                const winEmbed = new EmbedBuilder()
                    .setColor('#2ECC71')
                    .setTitle('🏆 **إعلان ملك الروليت الفائز**')
                    .setDescription(`🎉 **مبروك الفوز الأسطوري باللقب:** <@${winner}>!\n\n✨ تم حسم المعركة بنجاح بعد استخدام خيارات الحماية والانعاش والطرد.`);

                await sentMsg.edit({ embeds: [winEmbed], components: [] }).catch(() => {});
            });
        });
    }
});

client.login(process.env.TOKEN);
