

export const getTimeDesc = (time) => {

    let result = '';

    const minute = 1000 * 60;      //把分，时，天，周，半个月，一个月用毫秒表示

    const hour = minute * 60;

    const day = hour * 24;

    const week = day * 7;

    // const halfamonth = day * 15;

    const month = day * 30;

    const now = new Date().getTime();   //获取当前时间毫秒

    const diffValue = now - time;   //时间差

    if(diffValue < 0){
        return;
    }

    const minC = Math.floor(diffValue / minute);  //计算时间差的分，时，天，周，月

    const hourC =  Math.floor(diffValue / hour);

    const dayC =  Math.floor(diffValue / day);

    const weekC =  Math.floor(diffValue / week);

    const monthC =  Math.floor(diffValue / month);

    if (monthC >= 1 && monthC <= 3) {

        result = " " + parseInt(monthC) + "月前";

    } else if (weekC >= 1 && weekC <= 3) {

        result = " " + parseInt(weekC) + "周前";

    } else if (dayC >= 1 && dayC <= 6) {

        result = " " + parseInt(dayC) + "天前";

    } else if (hourC >= 1 && hourC <= 23) {

        result = " " + parseInt(hourC) + "小时前";

    } else if (minC >= 1 && minC <= 59) {

        result =" " + parseInt(minC) + "分钟前";

    } else if (diffValue >= 0 && diffValue <= minute) {

        result = "刚刚";

    } else {

        const datetime = new Date(time);

        const Nyear = datetime.getFullYear();

        const Nmonth = datetime.getMonth() + 1 < 10 ? "0" + (datetime.getMonth() + 1) : datetime.getMonth() + 1;

        const Ndate = datetime.getDate() < 10 ? "0" + datetime.getDate() : datetime.getDate();

        // const Nhour = datetime.getHours() < 10 ? "0" + datetime.getHours() : datetime.getHours();

        // const Nminute = datetime.getMinutes() < 10 ? "0" + datetime.getMinutes() : datetime.getMinutes();

        // const Nsecond = datetime.getSeconds() < 10 ? "0" + datetime.getSeconds() : datetime.getSeconds();

        result = Nyear + "-" + Nmonth + "-" + Ndate;
    }

    return result;
};


// 随机字符串
export const randomString = (len = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    const maxPos = chars.length;
  
    let str = '';
  
    for (let i = 0; i < len; i++) {
      str += chars.charAt(Math.floor(Math.random() * maxPos));
    }
  
    return str;
  };
  
  export const getUserId = () => {
    let _userId = window.localStorage.getItem('userId');
  
    if (_userId) {
      return _userId;
    } else {
      _userId = randomString(12);
  
      window.localStorage.setItem('userId', _userId);
  
      return _userId;
  
    }
  
  };
  
  export const isMy = (id) => {
    return id === window.localStorage.getItem('userId');
  };

  // export const serverListGlobal = [
  //   {
  //     group: '台服',
  //     name: '伊弗斯',
  //     type: 'PVP'
  //   },
  //   {
  //     group: '台服',
  //     name: '玛拉顿',
  //     type: 'PVE'
  //   },
  //   {
  //     group: '全球服',
  //     name: '阿拉希盆地',
  //     type: 'PVP'
  //   },
  //   {
  //     group: '全球服',
  //     name: '鱼人',
  //     type: 'PVE'
  //   }
  // ];
  
  export const serverList = [
    {
      group: '一区',
      name: '吉安娜',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '死亡猎手',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '红玉圣殿',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '哈霍兰',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '辛洛斯',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '辛迪加',
      type: 'RPPVP'
    },
    {
      group: '一区',
      name: '火锤',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '霜语',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '巫妖王',
      type: '普通'
    },
    {
      group: '一区',
      name: '无敌',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '无畏',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '伦鲁迪洛尔',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '光芒',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '克罗米',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '寒脊山小径',
      type: '普通'
    },
    {
      group: '一区',
      name: '希尔盖',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '德姆塞卡尔',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '怀特迈恩',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '末日之刃',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '毁灭之刃',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '水晶之牙',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '沙尔图拉',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '沙顶',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '法琳娜',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '艾隆纳亚',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '诺格弗格',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '骨火',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '黑曜石之锋',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '龙牙',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '加丁',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '埃提耶什',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '奥罗',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '怒炉',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '碧玉矿洞',
      type: '普通'
    },
    {
      group: '一区',
      name: '祈福',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '维克洛尔',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '莫格莱尼',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '萨弗拉斯',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '震地者',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '龙之召唤',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '奥金斧',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '席瓦莱恩',
      type: 'PVP'
    },
    {
      group: '一区',
      name: '灰烬使者',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '秩序之源',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '狮心',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '巨龙追猎者',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '觅心者',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '匕首岭',
      type: '普通'
    },
    {
      group: '五区',
      name: '布鲁',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '帕奇维克',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '维希度斯',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '范克瑞斯',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '冰封王座',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '银色北伐军',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '赫洛德',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '卓越',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '厄运之槌',
      type: '普通'
    },
    {
      group: '五区',
      name: '奎尔塞拉',
      type: 'PVP'
    },
  
    {
      group: '五区',
      name: '娅尔罗',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '安娜丝塔丽',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '巨人追猎者',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '巴罗夫',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '无尽风暴',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '曼多基尔',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '湖畔镇',
      type: '普通'
    },
    {
      group: '五区',
      name: '灵风',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '狂野之刃',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '维克尼拉斯',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '范沃森',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '审判',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '寒冰之王',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '比斯巨兽',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '比格沃斯',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '法尔班克斯',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '碧空之歌',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '雷德',
      type: 'PVP'
    },
    {
      group: '五区',
      name: '雷霆之击',
      type: 'PVP'
    },
    {
      group: '台服',
      name: '伊弗斯',
      type: 'PVP'
    },
    {
      group: '台服',
      name: '玛拉顿',
      type: 'PVE'
    },
    {
      group: '全球服',
      name: '阿拉希盆地',
      type: 'PVP'
    },
    {
      group: '全球服',
      name: '鱼人',
      type: 'PVE'
    },
    {
      group: '全球服',
      name: '逐风者',
      type: 'PVP'
    },
  ];

  export const getServerListOptions = () => {
    const _options = serverList.map((server, index) => ({
      key: `${server.group}  ${server.name}(${server.type})`,
      value: index,
    }));

    return _options;
  };

  export const sideListOptions = [
    {
      key: '联盟',
      value: 0,
    },
    {
      key: '部落',
      value: 1,
    }
  ];

  export const professionListOptions = [
    {
      key: '工程学',
      value: 0,
      icon: 'trade_engineering',
    },
    {
      key: '附魔',
      value: 1,
      icon: 'trade_engraving',
    },
    {
      key: '炼金术',
      value: 2,
      icon: 'trade_alchemy',
    },
    {
      key: '裁缝',
      value: 3,
      icon: 'trade_tailoring',
    },
    {
      key: '制皮',
      value: 4,
      icon: 'inv_misc_armorkit_17',
    },
    {
      key: '锻造',
      value: 5,
      icon: 'trade_blacksmithing',
    },
    {
      key: '珠宝加工',
      value: 6,
      icon: 'inv_misc_gem_01',
    },
    {
      key: '铭文',
      value: 7,
      icon: 'inv_inscription_tradeskill01',
    },
    {
      key: '烹饪',
      value: 8,
      icon: 'inv_misc_food_15',
    }
  ];

//   const getProfessionDataFromDatabase = async () => {
//     const [data1, data2, data3, data4, dataNpcCn, dataNpc, dataStatic] = await getProfessionSkills();
  
//     let _professionData = [];
  
//     data2.forEach((item, index) => {
//       if (item.type === 185) {
  
//         // 发现需要到拍卖行购买图纸，则纳入到列表
//         const bluePrint = bluePrints.find(_it => _it.name === `食谱：${data1[index].name}`);
  
//         let _index;
  
//         if (bluePrint) {
  
//           _index = data4.findIndex(_it => _it.name === bluePrint.name);
  
//         }
  
//         const bluePrintData = bluePrint ? {
//           ...data3[_index],
//           ...data4[_index]
//         } : null;
  
//         if (bluePrintData && bluePrintData.sources) {
//           bluePrintData.sources = bluePrintData.sources.map(_bp => {
  
//             let args = {};
  
//             if (_bp.npc_id) {
//               const _indexNpc = dataNpcCn.findIndex(_it => _it.id === _bp.npc_id);
  
//               args = {
//                 ...dataNpc[_indexNpc],
//                 ...dataNpcCn[_indexNpc],
//                 locations: dataNpc[_indexNpc].locations ? dataNpc[_indexNpc].locations.map(_loc => ({
//                   ..._loc,
//                   zone: dataStatic['zones'].find(_it => _it.id === _loc.zone_id).name
//                 })) : undefined
//               };
//             }
  
//             return {
//               ..._bp,
//               ...args
//             };
//           });
//         }
  
//         if (item.reagents) {
//           _professionData.push({
//             ...item,
//             name: data1[index].name,
//             creates: item.creates ? {
//               id: item.creates.item_id,
//               count: item.creates.item_count,
//               ...data3.find(_it => _it.id === item.creates.item_id),
//               ...data4.find(_it => _it.id === item.creates.item_id)
//             } : undefined
//             ,
//             isChecked: true,
//             isDisabled: false,
//             bluePrint: bluePrintData,
//             reagents: item.reagents ? item.reagents.map((reagent) => {
  
//               const _targetItemIndex = data3.findIndex(_that => _that.id === reagent.item_id);
  
//               return {
//                 ...data3[_targetItemIndex],
//                 count: reagent.item_count,
//                 ...data4[_targetItemIndex]
//               };
  
//             }) : []
//           });
//         }
  
//       }
//     });
  
//     _professionData = _professionData.sort((a, b) => a.learned_at_rank - b.learned_at_rank);
  
//     console.log(JSON.stringify(_professionData));
  
//   };



// bluePrint  sources
// {type: 1, min_level: 5, max_level: 34}  世界掉落
// npc 售卖
// {
//   "type": 7,
//   "npc_id": 2682,
//   "cost": {
//       "money": 1000
//   },
//   "available_count": 1,
//   "id": 2682,
//   "name": "弗拉德",
//   "classification": 0,
//   "min_level": 24,
//   "max_level": 24,
//   "react_to_alliance": 1,
//   "react_to_horde": -1,
//   "locations": [
//       {
//           "zone_id": 11,
//           "ranges": [
//               [
//                   [
//                       26.4,
//                       25.8
//                   ]
//               ]
//           ],
//           "zone": "湿地"
//       }
//   ],
//   "tag": "工程学供应商"
// }
// 
// 

// 去除冗余sources信息
// console.log(JSON.stringify(cookingData.map(_it => {
//   return {
//     ..._it,
//     creates: {
//       ..._it.creates,
//       sources: _it.creates && _it.creates.sources && _it.creates.sources.length > 20 && _it.creates.sources[10].type === 3 && !_it.creates.sources[10].available_count ? 'merchant' : 'auction',
//     },
//     reagents: _it.reagents.map(_reagent => ({
//       ..._reagent,
//       sources: _reagent && _reagent.sources && _reagent.sources.length > 20 && _reagent.sources[10].type === 3 && !_reagent.sources[10].available_count ? 'merchant' : 'auction',
//     }))
//   }
// })));

// const genBluePrint = (type, keyword) => {
//   const data = professionsDataArr[type];

//   console.log(data.map(item => {
//     const bluePrint = itemsData.find(_it => _it.name === `${keyword}：${item.name}`);

//     // console.log((bluePrint?.sources || []).map(it => it.type).join('#'));
//     console.log((bluePrint?.sources || []), item.name);

//     return {
//       ...item,
//       bluePrint: bluePrint || null,
//     };
//   }));
// }

// genBluePrint(8, '食谱');


// const simplifyData = (type) => {
//   const data = professionsDataArr[type];

//   console.log(data.map(dataItem => {
//     const { id, name, icon, color_level_1, color_level_2, color_level_3, color_level_4, creates, reagents, isChecked, isDisabled } = dataItem;

//     let bluePrint = dataItem.bluePrint;

//     if (bluePrint?.sources) {

//       bluePrint.sources = bluePrint.sources.map(_bp => {

//         let args = {};

//         // zone_id
//         if (_bp.zone_id) {
//           _bp.zoneName = dataStatic['zones'].find(_it => _it.id === _bp.zone_id).name;
//         }

//         // npc_id

//         if (_bp.npc_id) {
//           const _npc = npcsData.find(_np => _np.id === _bp.npc_id);

//           args.npcName = _npc?.name || undefined;

//           args.npcZones = _npc.locations ? _npc.locations.map(_loc => dataStatic['zones'].find(_it => _it.id === _loc.zone_id).name) : undefined;

//         }

//         // quest_id
//         if (_bp.quest_id) {
//           const _quest = questsData.find(_q => _q.id === _bp.quest_id);

//           if (_quest) {
//             args.questName = _quest.name;

//             if (_quest.objectives) {
//               // 世界事件相关信息
//               const _qo = _quest.objectives.map(({ item_id }) => (wordEventsData.find(it => !!it.item_ids.find(_id => _id === item_id)) || { name: '' }).name).filter(it => !!it);

//               if (_qo.length) {
//                 args.questObjectives = _qo;
//               }
//             }
//           }
//         }

//         // item_id

//         if (_bp.item_id) {
//           const _item = itemsData.find(_it => _it.id === _bp.item_id);

//           args.itemName = _item?.name || undefined;

//           const event = wordEventsData.find(it => !!it.item_ids.find(_id => _id === bluePrint.id));

//           if (event) {
//             args.itemEventName = event.name;
//           }

//         }

//         // object_id

//         if (_bp.object_id) {
//           const _obj = objectsData.find(_ob => _ob.id === _bp.object_id);

//           if (_obj) {
//             args.objName = _obj.name;

//             if (_obj.locations) {
//               args.objLocations = _obj.locations.map(_loc => dataStatic['zones'].find(_it => _it.id === _loc.zone_id).name);
//             }
//           }
//         }

//         if (_bp.skill_id) {
//           // spells type
//           const spell = spellsData.find(item => item.id === _bp.skill_id);

//           if (spell && spell.type) {
//             const _type = spell.type.split('.').slice(-1);
//             args.spellName = dataStatic.professionTypes.find(it => it.id == _type)?.name || '';
//           }

//         }

//         return {
//           ..._bp,
//           ...args
//         };

//       });

//     }

//     if (bluePrint) {
//       bluePrint = {
//         id: bluePrint.id,
//         icon: bluePrint.icon,
//         name: bluePrint.name,
//         quality: bluePrint.quality,
//         sources: bluePrint.sources,
//       };
//     }

//     return {
//       id,
//       name,
//       icon,
//       color_level_1,
//       color_level_2,
//       color_level_3,
//       color_level_4,
//       isChecked,
//       isDisabled,
//       creates: creates ? {
//         id: creates.id,
//         count: creates.count,
//         name: creates.name,
//         icon: creates.icon,
//         quality: creates.quality,
//         item_level: creates.item_level,
//         buy_price: creates.buy_price,
//         sell_price: creates.sell_price,
//         sources: creates.sources
//       } : undefined,
//       reagents: reagents ? reagents.map(it => ({
//         id: it.id,
//         count: it.count,
//         name: it.name,
//         icon: it.icon,
//         quality: it.quality,
//         item_level: it.item_level,
//         buy_price: it.buy_price,
//         sell_price: it.sell_price,
//         sources: it.sources
//       })) : undefined,
//       bluePrint: bluePrint || undefined,
//     };
//   }));
// };

// simplifyData(8);


// const processSourcesTypes = (type) => {
//   const _data = professionsDataArr[type];

//   console.log(_data.map(item => {
//     if (item.bluePrint && item.bluePrint.sources) {
//       let sourcesType = [1,2,4];

//       let defaultAccess = 4;

//       item.bluePrint.sources.forEach(_source => {
//         if (_source.type === 3 && (sourcesType.indexOf(3) === -1)) {
//           sourcesType.splice(2, 0, 3);

//           defaultAccess = 3;
//         }

//         if (_source.type === 4) {
//           defaultAccess = 1;
//         }
//       });

//       return {
//         ...item,
//         bluePrint: {
//           ...item.bluePrint,
//         },
//         sourcesType,
//         defaultAccess: item.isDisabled ? 2 : (item.isChecked ? defaultAccess : 2),
//       };

//     } else {
//       // 无图纸需求，默认启用  若为禁用状态则默认禁用
//       return {
//         ...item,
//         sourcesType: [1,2],
//         defaultAccess: item.isDisabled ? 2 : 1,
//       };
//     }
//   }));

// };

// processSourcesTypes(8);


// const processSourcesTypes = (type) => {
//   const _data = professionsDataArr[type];

//   console.log(_data.map(item => {
//     if (item.bluePrint && item.bluePrint.sources) {
//       // 将 sources 按照 types 归类处理

//       // 固定顺序，分别为 商人购买 其它
//       let sources = [null, null];

//       let defaultAccess = item.defaultAccess;

//       item.bluePrint.sources.forEach(_source => {

//         if (_source.type === 3) {
//           if (sources[0]) {
//             sources[0].push(_source);
//           } else {
//             sources[0] = [_source];
//           }
//         } else {
//           if (_source.type === 4 && !item.isDisabled) {
//             defaultAccess = 5;
//           }
//           if (sources[1]) {
//             sources[1].push(_source);
//           } else {
//             sources[1] = [_source];
//           }
//         }

//       });

//       return {
//         ...item,
//         bluePrint: {
//           ...item.bluePrint,
//           sources
//         },
//         defaultAccess,
//       };

//     } else {
//       return item;
//     }
//   }));

// };

// processSourcesTypes(8);

// 处理数据，将 sources 类型枚举出来

// isChecked 转换为 access options 
// defaultAccess
// 启用 1 禁用 2 NPC 购买3  拍卖行购买4

// const processSourcesTypes = (type) => {
//   const _data = professionsDataArr[type];

//   console.log(_data.map(item => {
//     if (item.bluePrint && item.bluePrint.sources) {
//       // 将 sources 按照 types 归类处理

//       // 固定顺序，分别为 商人购买 其它
//       let sources = [null, null];

//       let access = item.access;

//       item.bluePrint.sources.forEach(_source => {

//         if (_source.type === 3) {
//           if (sources[0]) {
//             sources[0].push(_source);
//           } else {
//             sources[0] = [_source];
//           }
//         } else {
//           if (_source.type === 4 && !item.isDisabled && item.isChecked) {
//             access = 5;
//           }
//           if (sources[1]) {
//             sources[1].push(_source);
//           } else {
//             sources[1] = [_source];
//           }
//         }

//       });

//       return {
//         ...item,
//         bluePrint: {
//           ...item.bluePrint,
//           sources
//         },
//         access,
//       };

//     } else {
//       return item;
//     }
//   }));

// };

// processSourcesTypes(8);

// 声望相关
// items 图纸 requires_faction { faction_id static 文件内 factions  reputation_id 3 中立 4 友善  5 尊敬 6 崇敬  7 崇拜  } 

// const processReputation = (type) => {
//   const _data = professionsDataArr[type];

//   console.log(_data.map(item => {

//     const bluePrint = item.bluePrint;

//     if (item.bluePrint) {
//       // 从 items 中获取图纸信息
//       const _bp = itemsData.find(_it => _it.id === item.bluePrint.id);

//       if (_bp.requires_faction) {
//         const { faction_id, reputation_id } = _bp.requires_faction;

//         // console.log(_bp.name, staticData.factions.find(_fa => _fa.id === faction_id));

//         _bp.requires_faction.name = (staticData.factions.find(_fa => _fa.id === faction_id) || { name: undefined }).name;

//       }

//       return {
//         ...item,
//         access: _bp.requires_faction?.reputation_id > 4 ? 2 : item.access,
//         bluePrint: {
//           ...item.bluePrint,
//           requires_faction: _bp.requires_faction
//         }
//       }

//     }

//     return item;

//   }));

// };

// processReputation(8);

// TODO 添加是否拥有前序材料制作项标志位，前序材料id
// const processReputation = (type) => {
//   const _data = professionsDataArr[type];

//   console.log(_data.map(item => {

//     let preProducedMaterial = [];

//     if (item.reagents) {
//       item.reagents.forEach(_reagent => {
//         let targetItem = _data.find(_it => _it.creates?.id === _reagent.id);

//         if (targetItem) {
//           preProducedMaterial.push({
//             id: targetItem.id,
//             count: _reagent.count ||　1
//           })
//         }
//       });

//     }

//     return {
//       ...item,
//       preProducedMaterial: preProducedMaterial.length ? preProducedMaterial : undefined
//     };

//   }));

// };

// processReputation(8);