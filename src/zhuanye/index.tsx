import react, { useEffect, useState, useRef } from "react";
import logo from "./logo.svg";
import "./App.scss";
import ItemWithTip from "./components/ItemWithTip";
import engineeringData from "./utils/engineering.json";
import enchantingData from "./utils/enchanting.json";
import alchemyData from "./utils/alchemy.json";
import tailoringData from "./utils/tailoring.json";
import leatherworkingData from "./utils/leatherworking.json";
import blacksmithingData from "./utils/blacksmithing.json";
import jewelcraftingData from "./utils/jewelcrafting.json";
import inscriptionData from "./utils/inscription.json";
import cookingData from "./utils/cooking.json";

import {
  getTimeDesc,
  isMy,
  randomString,
  getUserId,
  serverList,
  getServerListOptions,
  professionListOptions,
  sideListOptions,
} from "./utils/index.js";

import {
  genFileName,
  uploadFile,
  getTargetProfessionData,
  getFileList,
} from "./utils/uploadOss";

import Select from "./components/Select";

import Message from "./components/Message";

import ImgLianMeng from "./asserts/img/lianmeng.png";

import ImgBuLuo from "./asserts/img/buluo.png";

import ImgServer from "./asserts/img/server.png";

// import itemsData from './data/items.json';
// import staticData from './data/static.json';

// 工程学 附魔 炼金术  裁缝 制皮 锻造 珠宝加工 铭文
const professionsTypeArr = [
  "工程学",
  "附魔",
  "炼金术",
  "裁缝",
  "制皮",
  "锻造",
  "珠宝加工",
  "铭文",
  "烹饪",
];
const professionsDataArr = [
  engineeringData,
  enchantingData,
  alchemyData,
  tailoringData,
  leatherworkingData,
  blacksmithingData,
  jewelcraftingData,
  inscriptionData,
  cookingData,
];

const reputationMap = {
  3: "中立",
  4: "友善",
  5: "尊敬",
  6: "崇敬",
  7: "崇拜",
};

let hasReStore = window.localStorage.getItem("hasReStore");

if (!hasReStore) {
  window.localStorage.setItem("userConfig", JSON.stringify({}));

  window.localStorage.setItem("priceData", JSON.stringify({}));

  window.localStorage.setItem("hasReStore", "ok");
}

const App = () => {
  // 是否自导入价格数据
  const [priceManual, setPriceManual] = useState(false);

  // 价格数据表
  const [priceDataList, setPriceDataList] = useState([]);

  // 用户设置
  const [userConfig, setUserConfig] = useState(
    JSON.parse(window.localStorage.getItem("userConfig") || "{}")
  );

  // 价格数据表加载状态
  const [listStatus, setListStatus] = useState("init");

  const shoppingListEl = useRef(null);

  const materialListEl = useRef(null);

  const [importModalShow, setImportModalShow] = useState(false);

  const [importDataStr, setImportDataStr] = useState("");

  const [messages, setMessages] = useState([]);

  // 防抖
  const [stick, setStick] = useState(false);

  const [priceData, setPriceData] = useState(
    JSON.parse(window.localStorage.getItem("priceData") || "{}")
  );

  const [materialModalShow, setMaterialModalShow] = useState(false);

  // 简化计算
  const [pathData, setPathData] = useState();

  const [processIndex, setProcessIndex] = useState(1);

  const [processStop, setProcessStop] = useState(false);

  const [hoverItem, setHoverItem] = useState(null);

  const [highLightItem, setHighLightItem] = useState(null);

  const [loadingGlobal, setLoadingGlobal] = useState(false);

  useEffect(() => {
    if (!userConfig.start) {
      updateUserConfig("start", "1");
    }

    if (!userConfig.end) {
      updateUserConfig("end", "450");
    }
  }, []);

  // 本地缓存用户配置
  useEffect(() => {
    window.localStorage.setItem("userConfig", JSON.stringify(userConfig || {}));
  }, [userConfig]);

  useEffect(() => {
    window.localStorage.setItem("priceData", JSON.stringify(priceData || {}));
  }, [priceData]);

  useEffect(() => {
    if (userConfig.professionType || userConfig.professionType === 0) {
      const _itemsStatus = {};

      professionsDataArr[userConfig.professionType].forEach(
        ({ name, access }) => {
          _itemsStatus[name] = {
            access,
            sellType: "merchant",
            pdCost: null,
            acCostAuc: null,
            acCostMer: null,
          };
        }
      );

      updateUserConfig("itemsStatus", _itemsStatus);
    }
  }, [userConfig.professionType]);

  useEffect(() => {
    if (userConfig.step === 2) {
      loadPriceDataList();
      initShoppingStr();
    } else {
      setListStatus("init");
    }
  }, [userConfig.step]);

  useEffect(() => {
    let interval = null;

    if (userConfig.step === 2 && priceManual) {
      if (processStop) {
        clearInterval(interval);
      } else {
        interval = setInterval(() => {
          setProcessIndex((prev) => (prev === 11 ? 1 : prev + 1));
        }, 4000);
      }
    } else {
      clearInterval(interval);

      setProcessIndex(1);

      setProcessStop(false);
    }

    return () => {
      clearInterval(interval);
    };
  }, [userConfig.step, priceManual, processStop]);

  useEffect(() => {
    if (
      priceData &&
      professionsDataArr[userConfig.professionType] &&
      userConfig.step === 3
    ) {
      setLoadingGlobal(true);

      setTimeout(() => {
        setPathData(genUpgradePath());
        setLoadingGlobal(false);
      }, 0);

      // setPathData(genUpgradePath());
    }
  }, [userConfig, priceData]);

  useEffect(() => {
    if (priceData.status === "ok") {
      let _itemsStatus = { ...userConfig.itemsStatus };

      professionsDataArr[userConfig.professionType].forEach((item) => {
        // 计算 生产成本 实际成本/商店出售  实际成本/拍卖行出售
        const _pdCost = getNeed(item, true);

        const _acCostAuc = getActualCost(item, true, false, "auction");

        const _acCostMer = getActualCost(item, true, false);

        // console.log(_proCost, _acCostAuc, _acCostMer);

        _itemsStatus[item.name] = {
          ..._itemsStatus[item.name],
          pdCost: _pdCost,
          acCostAuc: _acCostAuc,
          acCostMer: _acCostMer,
        };
      });

      updateUserConfig("itemsStatus", _itemsStatus);
    }
  }, [priceData]);

  const updateUserConfig = (key, value) => {
    setUserConfig((_prevConfig) => ({
      ..._prevConfig,
      [key]: value,
    }));
  };

  const loadPriceDataList = () => {
    const { server, side, professionType } = userConfig;

    setListStatus("loading");

    getTargetProfessionData({
      server,
      side,
      professionType,
    })
      .then((res) => {
        let _arr = res.objects || [];

        let _targetArr = [];

        for (let i = 0; i < _arr.length; i++) {
          let [
            _prefix,
            _type,
            _side,
            _server,
            _start,
            _end,
            _userId,
            _timeWithSuffix,
            _lengthWithSuffix,
          ] = _arr[i].name.split("-");

          const _time = parseInt(_timeWithSuffix.split(".")[0]);

          const _length = parseInt((_lengthWithSuffix || "").split(".")[0]);

          const _current = new Date().getTime();

          // 只显示两个月内
          // 只显示响应的点数范围内的
          // 最多选5条

          if (_current - _time < 5184000000) {
            _targetArr.push({
              userId: _userId,
              time: _time,
              server: parseInt(_server),
              side: parseInt(_side),
              start: _start,
              end: _end,
              profession: parseInt(_type),
              status: "init",
              length: _length,
              url: _arr[i].url,
              isChecked: false,
            });
          }
        }

        const _resArr = _targetArr.sort((a, b) => b.time - a.time).slice(0, 5);

        _resArr[0] && (_resArr[0].isChecked = true);

        _resArr[1] && (_resArr[1].isChecked = true);

        _resArr[2] && (_resArr[2].isChecked = true);

        setPriceDataList(_resArr);

        setListStatus("ok");

        // if (!_resArr.length) {
        //   setPriceManual(true);
        // }
      })
      .catch((e) => {
        console.log(e);
        setListStatus("error");
      });
  };

  const genShoppingList = () => {
    shoppingListEl.current.select();

    document.execCommand("copy");

    // alert('已将购物清单复制到剪切板');

    setMessages((_prev) => [
      ..._prev,
      <Message
        key={Math.random()}
        type="success"
        duration={3000}
        content="已将购物清单复制到剪切板"
      />,
    ]);
  };

  const initShoppingStr = () => {
    const _data = professionsDataArr[userConfig.professionType];

    let inputOutput = [];

    _data.forEach((item, index) => {
      if (!item.isDisabled) {
        // 发现材料不在列表中，则降材料纳入列表
        if (item.reagents) {
          item.reagents.forEach((_reag) => {
            if (!inputOutput.find((_inOut) => _inOut.name == _reag.name)) {
              if (!(_reag.sources && _reag.sources === "merchant")) {
                inputOutput.push(_reag);
              }
            }
          });
        }

        // 发现产物不在列表中，则降产物纳入列表
        if (
          item.creates?.name &&
          !inputOutput.find((_inOut) => _inOut.name == item.creates.name)
        ) {
          inputOutput.push(item.creates);
        }

        if (userConfig.professionType == 1 && item.name.indexOf("附魔") === 0) {
          inputOutput.push({ name: `卷轴：${item.name}` });
        }

        // 加入设计图
        if (
          item.bluePrint?.name &&
          !inputOutput.find((_inOut) => _inOut.name == item.bluePrint.name)
        ) {
          inputOutput.push(item.bluePrint);
        }
      }
    });

    let _priceData = {};

    let _outputStr = "";

    inputOutput.forEach((_io) => {
      _priceData[_io.name] = null;

      _outputStr = _outputStr + `^"${_io.name}";;;;;;;;;;`;
    });

    setPriceData(_priceData);

    shoppingListEl.current.value = `${
      professionsTypeArr[userConfig.professionType]
    }1-450${_outputStr}`;
  };

  const step1Enabled = () => {
    const { professionType, server, side } = userConfig;

    return (
      (professionType || professionType === 0) &&
      (server || server === 0) &&
      (side || side === 0)
    );
  };

  const handleImportPriceData = () => {
    if (!(importDataStr || "").trim()) {
      // alert('价格数据不能为空！');

      setMessages((_prev) => [
        ..._prev,
        <Message
          key={Math.random()}
          type="error"
          duration={3000}
          content="价格数据不能为空！"
        />,
      ]);

      return;
    }

    if (importDataStr.indexOf(";;;;;;;;;") > -1) {
      // alert('导出数据时请点击插件右下角"导出结果"按钮，而非右上角"导出"按钮！');

      setMessages((_prev) => [
        ..._prev,
        <Message
          key={Math.random()}
          type="error"
          duration={5000}
          content='导出数据时请点击插件右下角"导出结果"按钮，而非右上角"导出"按钮！'
        />,
      ]);

      return;
    }

    const _arr = importDataStr.split("\n");

    if (_arr.length) {
      if (_arr[0].indexOf("名称") > -1 || _arr[0].indexOf("名稱") > -1) {
        _arr.shift();
      }
    } else {
      // alert('请检查数据格式是否符合要求！');

      setMessages((_prev) => [
        ..._prev,
        <Message
          key={Math.random()}
          type="error"
          duration={3000}
          content="请检查数据格式是否符合要求！"
        />,
      ]);

      return;
    }

    // 判断结构是否正确  priceData

    const _current = new Date().getTime();

    const { professionType, server, side } = userConfig;

    let _priceData = {
      userId: getUserId(),
      time: _current,
      server,
      side,
      start: 1,
      end: 450,
      profession: professionType,
      status: "ok",
      length: _arr.length,
      isChecked: true,
    };

    for (let i = 0; i < _arr.length; i++) {
      const _item = _arr[i];

      const [price, name] = _item.split(",");

      if (name && (parseInt(price) || price === "0")) {
        // _priceData[name.replace('卷轴：', '')] = parseInt(price);
        // .replace(/(\s+\(\d+\)|")/g, '')
        // _priceData[name.replace(/"/g, '')] = parseInt(price);
        _priceData[name.replace(/(\s+\(\d+\)|")/g, "")] = parseInt(price);
      } else {
        // alert('数据解析失败，请检查数据格式是否符合要求！');

        setMessages((_prev) => [
          ..._prev,
          <Message
            key={Math.random()}
            type="error"
            duration={3000}
            content="数据解析失败，请检查数据格式是否符合要求！"
          />,
        ]);

        return;
      }
    }

    setPriceManual(false);

    setImportModalShow(false);

    setImportDataStr("");

    setPriceDataList((prev) => {
      const arr = [_priceData, ...prev];

      return arr;
    });

    console.log("上传价格数据");

    uploadFile(
      genFileName({
        server,
        side,
        professionType,
        time: _current,
        start: 1,
        end: 450,
        userId: getUserId(),
        length: _arr.length,
      }),
      JSON.stringify(_priceData)
    );
  };

  const handleGenUpgradePath = async () => {
    if (stick) {
      return;
    }

    setStick(true);

    fetch(
      `https://wowpro.oss-cn-shanghai.aliyuncs.com/step2/${userConfig.professionType}_${userConfig.server}_${userConfig.side}`,
      { method: "HEAD" }
    ).catch((error) => console.error("请求失败:", error));

    let _targetIndexes = [];

    let _initArr = [];

    priceDataList.forEach((_data, _index) => {
      if (_data.isChecked) {
        if (_data.status === "ok") {
          _initArr.push(_data);
        } else {
          _targetIndexes.push(_index);

          setPriceDataList((_prevList) => {
            const _arr = [..._prevList];
            _arr[_index].status = "loading";

            return _arr;
          });
        }
      }
    });

    if (_targetIndexes.length || _initArr.length) {
      // 设置 loading 状态

      let _dataList = [];

      try {
        _dataList = await Promise.all(
          _targetIndexes.map((_index) =>
            fetch(priceDataList[_index].url).then((res) => res.json())
          )
        );

        _targetIndexes.forEach((_index) => {
          setPriceDataList((_prevList) => {
            const _arr = [..._prevList];
            _arr[_index].status = "ok";

            return _arr;
          });
        });
      } catch (e) {
        _targetIndexes.forEach((_index) => {
          setPriceDataList((_prevList) => {
            const _arr = [..._prevList];
            _arr[_index].status = "error";

            return _arr;
          });
        });

        setMessages((_prev) => [
          ..._prev,
          <Message
            key={Math.random()}
            type="error"
            duration={4000}
            content="价格详细信息加载失败！请重试"
          />,
        ]);

        setStick(false);

        return;
      }

      // 获取到价格信息，计算加权，遍历价格，取平均值
      // console.log(_dataList);

      let _priceData = { ...priceData, status: "ok" };

      Object.keys(priceData).forEach((key) => {
        let _priceArr = [..._initArr, ..._dataList].map((_p) =>
          _p[key] || _p[key] === 0 ? _p[key] : null
        );

        let _total = 0;
        let _count = 0;

        _priceArr.forEach((_price) => {
          if (_price || _price === 0) {
            _count += 1;
            _total += _price;
          }
        });

        _priceData[key] = _count > 0 ? Math.round(_total / _count) : null;
      });

      // userConfig.itemsStatus

      setPriceData(_priceData);

      updateUserConfig("step", 3);
    }

    setStick(false);
  };

  // 防抖设定

  const getPrice = (price, count = 1, sell_price) => {
    price = price || 0;

    let isNagative = price < 0;

    price = Math.abs(price);

    let isSellPrice = false;

    if ((!price && sell_price) || (price && sell_price > price)) {
      price = sell_price;
      isSellPrice = true;
    }

    // const tong = parseInt(`${price * count}`.slice(-2) || '0');

    // const siliver = parseInt(`${price * count}`.slice(-4, -2) || '0');

    const tong = (price * count) % 100;

    const siliver = Math.floor(((price * count) % 10000) / 100);

    const gold = Math.floor((price * count) / 10000);

    return (
      <span style={{ fontSize: 12 }}>
        {gold ? (
          <span className="coin-gold" style={{ color: "#ffc800" }}>
            {gold}
          </span>
        ) : (
          ""
        )}
        {siliver ? (
          <span className="coin-silver" style={{ color: "#eee" }}>
            {siliver}
          </span>
        ) : (
          ""
        )}
        {tong ? (
          <span className="coin-copper" style={{ color: "#ff8d00" }}>
            {tong}
          </span>
        ) : (
          ""
        )}
        {isSellPrice ? <span className="trade-tag">商</span> : ""}
        {isNagative ? <span className="trade-tag">赚</span> : ""}
      </span>
    );
  };

  const handleAccessChange = (name, value, isDisabled) => {
    if (isDisabled) {
      return;
    }

    if (userConfig.itemsStatus[name]?.access != value) {
      setUserConfig((_prevConfig) => {
        const _itemsStatus = { ..._prevConfig.itemsStatus };

        _itemsStatus[name] = {
          ..._itemsStatus[name],
          access: value,
        };

        return {
          ..._prevConfig,
          itemsStatus: _itemsStatus,
        };
      });
    }
  };

  const genSources = (sources, item) => {
    if (sources?.length) {
      const [merchantSources, otherSources] = sources;

      return (
        <div className="fs-12">
          {merchantSources ? (
            <div className="sources-wrap">
              <div
                className={`sources-title type-3 ${
                  userConfig?.itemsStatus[item.name].access == 3 ? "active" : ""
                }`}
                onClick={() => {
                  handleAccessChange(item.name, 3, item.isDisabled);
                }}
              >
                <div className="flex flex-column">
                  <div>
                    NPC 购买&nbsp;({merchantSources.length})&nbsp;&nbsp;
                    {getPrice(item.bluePrint.buy_price)}
                  </div>

                  {item.bluePrint.requires_faction ? (
                    <div className="faction">
                      {item.bluePrint.requires_faction.name}
                      &nbsp;&nbsp;
                      {
                        reputationMap[
                          item.bluePrint.requires_faction.reputation_id
                        ]
                      }
                    </div>
                  ) : null}
                </div>
              </div>

              <ul className="sources-list" style={{ color: "#1eff00" }}>
                {merchantSources.map((_source) => (
                  <li key={_source.npcName} className="flex items-center">
                    <div className="source-marker source-marker-sell"></div>
                    {`${_source.npcName}-${(_source.npcZones || []).join(
                      "/"
                    )}`}{" "}
                    &nbsp;
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {otherSources ? (
            <div className="sources-wrap">
              <p
                className={`sources-title type-5 ${
                  userConfig?.itemsStatus[item.name].access == 5 ? "active" : ""
                }`}
                onClick={() => {
                  handleAccessChange(item.name, 5, item.isDisabled);
                }}
              >
                掉落、任务或其它渠道&nbsp;({otherSources.length})&nbsp;
              </p>

              <div className="sources-list">
                {otherSources.map((_source, index) => {
                  switch (_source.type) {
                    // 区域掉落
                    case 0:
                      return (
                        <div
                          className="flex items-center"
                          key={index}
                          style={{ color: "#ccc" }}
                        >
                          <div className="source-marker source-marker-drop-many"></div>
                          {`区域掉落: ${_source.zoneName}`}
                        </div>
                      );
                    // 世界掉落
                    case 1:
                      return (
                        <div
                          className="flex items-center"
                          key={index}
                          style={{ color: "#ccc" }}
                        >
                          <div className="source-marker source-marker-drop-many"></div>
                          {`世界掉落: 等级 ${_source.min_level}~${_source.max_level}`}
                        </div>
                      );
                    // 指定怪物掉落
                    case 2:
                      return (
                        <div
                          className="flex items-center"
                          key={index}
                          style={{ color: "#ff3333" }}
                        >
                          <div className="source-marker source-marker-drop"></div>
                          {`${(_source.npcZones || []).join("/")}-${
                            _source.npcName
                          }`}
                        </div>
                      );
                    // 任务事件
                    case 4:
                      return (
                        <div
                          className="flex items-center"
                          key={index}
                          style={{ color: "#ffd100" }}
                        >
                          <div className="source-marker source-marker-quest-end"></div>
                          {`${_source.questName}${
                            _source.questObjectives
                              ? `【${_source.questObjectives.join("/")}】`
                              : ""
                          }`}
                        </div>
                      );
                    // 专业制造
                    case 5:
                      return (
                        <div
                          className="flex items-center"
                          key={index}
                          style={{ color: "#ffd100" }}
                        >
                          {_source.spellName ? `${_source.spellName} 制造` : ""}
                        </div>
                      );
                    // 物品开出
                    case 7:
                      return (
                        <div
                          className="flex items-center"
                          key={index}
                          style={{ color: "#fff" }}
                        >
                          {_source.itemIcon ? (
                            <div className="wow-icon wow-icon-tiny">
                              <img
                                src={`./resources/wlk/icons/medium/${_source.itemIcon}.jpg`}
                              />
                            </div>
                          ) : null}
                          &nbsp;
                          {`${_source.itemName}${
                            _source.itemEventName
                              ? `【${_source.itemEventName}】`
                              : ""
                          }`}
                        </div>
                      );
                    // 地图物品触发
                    case 8:
                      return (
                        <div
                          className="flex items-center"
                          key={index}
                          style={{ color: "#ffd100" }}
                        >
                          <div className="source-marker source-marker-interact"></div>
                          {`${_source.objName}-${(
                            _source.objLocations || []
                          ).join("/")}`}
                        </div>
                      );
                    default:
                      console.log(_source, item);
                      return null;
                      break;
                  }
                })}
              </div>
            </div>
          ) : null}
        </div>
      );
    } else {
      return <></>;
    }
  };

  const getNeed = (item, pure = false, single = false, times = 5) => {
    const reagents = item.reagents;

    let total = 0;

    let isMiss = false;

    reagents.forEach((reagent) => {
      let _price = getReagentPrice(reagent, true, true) || 0;

      if (!_price) {
        const _it = professionsDataArr[userConfig.professionType].find(
          (it) => it.creates?.id === reagent.id
        );
        if (_it) {
          if (times > 1) {
            const _need = getNeed(_it, true, true, times - 1);

            if (isMiss) {
              _price = 0;
            } else {
              _price = _need.total;
            }
          } else {
            console.log("过度递归");
            console.log(item);
            console.log(reagent);
          }
        }
      }

      total += _price * reagent.count;

      if (!_price) {
        isMiss = true;
      }
    });

    if (single) {
      total = Math.round(total / (item.creates?.count || 1));
    }

    if (pure) {
      return {
        total,
        isMiss,
      };
    }

    return getPrice(total);
  };

  const getActualCost = (item, pure = false, single = false, type) => {
    if (!item.reagents || !priceData) {
      return;
    }

    const _cost = getNeed(item, true);

    if (_cost.isMiss) {
      if (pure) {
        return {
          isMiss: true,
          total: 0,
        };
      }

      return "";
    }

    let _sellPrice = 0;

    switch (type || userConfig.itemsStatus[item.name].sellType) {
      case "auction":
        _sellPrice =
          (priceData[
            item.name.indexOf("附魔") === 0
              ? `卷轴：${item.name}`
              : item.creates.name
          ] || 0) * (item.creates?.count || 1);
        break;
      case "merchant":
        _sellPrice = (item.creates.sell_price || 0) * (item.creates.count || 1);
        break;
      // case 'custom':
      //   let _price = 0;

      //   if (customPriceData[item.name] && customPriceData[item.name].length) {
      //     const [gold, siliver, tong] = customPriceData[item.name];
      //     _price = (parseInt(gold || '0') * 10000) + (parseInt(siliver || '0') * 100) + parseInt(tong || '0');
      //   }

      //   _sellPrice = _price;

      //   break;

      default:
        _sellPrice = (item.creates.sell_price || 0) * (item.creates.count || 1);
        break;
    }

    let _price = single
      ? Math.round((_cost.total - _sellPrice) / (item.creates.count || 1))
      : _cost.total - _sellPrice;

    if (pure) {
      return {
        isMiss: false,
        total: _price,
      };
    }

    return getPrice(_price);
  };

  const isWithBlueEnable = (_it, bluePrintPrice) => {
    const { color_level_1, color_level_2, color_level_3, color_level_4 } = _it;

    let _start = color_level_1 || color_level_2 || color_level_3;

    let _end = color_level_4 || color_level_3;

    let costWithItem = 0;
    let costWithOutItem = 0;

    // 考虑必经过路线的影响

    let isOnly = false;

    if (_end > _start) {
      for (let i = _start; i < _end; i++) {
        let targetWithItem = null;
        let targetWithOutItem = null;

        professionsDataArr[userConfig.professionType].forEach((item) => {
          const { color_level_1, color_level_2, color_level_3, color_level_4 } =
            item;

          let low = color_level_1 || color_level_2 || color_level_3;

          let high = color_level_4 || color_level_3;

          if (i >= low && i < high) {
            let ratio = 1;

            ratio = (
              (color_level_4 - color_level_2) /
              (color_level_4 - i)
            ).toFixed(2);

            if (ratio < 1) {
              ratio = 1;
            }

            const _needRes =
              userConfig.itemsStatus[item.name].sellType === "auction"
                ? userConfig.itemsStatus[item.name].acCostAuc
                : userConfig.itemsStatus[item.name].acCostMer;

            if (!_needRes) {
              return false;
            }

            if (!_needRes.isMiss) {
              const _price = _needRes.total * ratio;

              if (targetWithItem) {
                if (_price < targetWithItem.price) {
                  targetWithItem = {
                    ...item,
                    price: _price,
                    point: i,
                  };
                }
              } else {
                // 根据品质计算涨一点需要的价格
                targetWithItem = {
                  ...item,
                  price: _price,
                  point: i,
                };
              }

              if (_it.name !== item.name) {
                if (targetWithOutItem) {
                  if (_price < targetWithOutItem.price) {
                    targetWithOutItem = {
                      ...item,
                      price: _price,
                      point: i,
                    };
                  }
                } else {
                  targetWithOutItem = {
                    ...item,
                    price: _price,
                    point: i,
                  };
                }
              }
            }
          }
        });

        if (targetWithItem) {
          // arrWithItem.push(targetWithItem);
          costWithItem += targetWithItem.price;
        }

        if (targetWithOutItem) {
          // arrWithOutItem.push(targetWithOutItem);
          costWithOutItem += targetWithOutItem.price;
        }

        if (targetWithItem && !targetWithOutItem) {
          isOnly = true;
        }
      }

      if (isOnly || costWithItem + bluePrintPrice < costWithOutItem) {
        return true;
      }
    }

    return false;

    // 根据 item 的成本，item 的范围，计算在此范围内的路线物品，然后对比加上蓝图的成本和排除在外的成本
  };

  const genUpgradePath = () => {
    const _start = parseInt(userConfig.start);
    const _end = parseInt(userConfig.end);

    if (isNaN(_start) || isNaN(_end)) {
      return {
        errorMessage: "起始或终止参数格式不正确",
      };
    }

    if (_start < 1) {
      return {
        errorMessage: "起始点数不能小于1",
      };
    } else if (_end > 450) {
      return {
        errorMessage: "终止点数不能大于450",
      };
    } else if (_start >= _end) {
      return {
        errorMessage: "终止点数应大于起始点数",
      };
    }

    // 橙色（红色），做一次必涨1点专业技能；有些后面还有个箭头加一个数字的，表示做一个能涨该数字的技能点数。
    // 黄色：做一次有80%的概率涨一点专业技能
    // 绿色：做一次有40%的概率涨一点

    let itemArr = [];

    let reagents = [];

    let excludeItems = {};

    // 计算每一个点位的制作选择
    for (let i = _start; i < _end; i++) {
      // 寻找该点所有可制造的物品

      let targetItem = null;

      professionsDataArr[userConfig.professionType].forEach((item) => {
        // access 逻辑
        // 根据 access 类型计算 cost
        if (
          userConfig?.itemsStatus[item.name]?.access != 2 &&
          !excludeItems[item.name]
        ) {
          // 忽略可任务获取或者从商人处购买的低于10J的配方（计算快）

          let _access;

          if (userConfig.itemsStatus[item.name].access && !item.notPassed) {
            _access = parseInt(userConfig?.itemsStatus[item.name]?.access);

            switch (_access) {
              case 1:
                break;
              case 3:
                // npc超过 10J 的图纸才会做排除路线计算
                if (item.bluePrint?.buy_price > 100000) {
                  if (!isWithBlueEnable(item, item.bluePrint?.buy_price)) {
                    excludeItems[item.name] = true;
                  }
                }
                break;
              case 4:
                if (priceData[item.bluePrint.name]) {
                  if (!isWithBlueEnable(item, priceData[item.bluePrint.name])) {
                    excludeItems[item.name] = true;
                  }
                }
                break;
              case 5:
                break;
              default:
                break;
            }
          }

          if (!excludeItems[item.name]) {
            const {
              color_level_1,
              color_level_2,
              color_level_3,
              color_level_4,
            } = item;

            let low = color_level_1 || color_level_2 || color_level_3;

            let high = color_level_4 || color_level_3;

            if (i >= low && i < high) {
              // 橙色区间 ratio 1  黄色区间 ratio 1.25   绿色区间 2.5

              let ratio = 1;

              ratio = (
                (color_level_4 - color_level_2) /
                (color_level_4 - i)
              ).toFixed(2);

              if (ratio < 1) {
                ratio = 1;
              }

              const _needRes =
                userConfig.itemsStatus[item.name].sellType === "auction"
                  ? userConfig.itemsStatus[item.name].acCostAuc
                  : userConfig.itemsStatus[item.name].acCostMer;

              if (!_needRes) {
                console.log("获取needRes失败");
                console.log(item);
                return;
              }

              // 判断是否为必走路线物品(如附魔棒子)  notPassed true passCount
              if (item.notPassed && low + (item.passCount || 1) > i) {
                const _price = _needRes.total * ratio;

                targetItem = {
                  ...item,
                  price: _price,
                  point: i,
                  ratio,
                  ensure: true,
                };
              } else {
                if (!_needRes.isMiss) {
                  const _price = _needRes.total * ratio;

                  if (targetItem) {
                    if (_price < targetItem.price && !targetItem.ensure) {
                      targetItem = {
                        ...item,
                        price: _price,
                        point: i,
                        ratio,
                      };
                    }
                  } else {
                    // 根据品质计算涨一点需要的价格
                    targetItem = {
                      ...item,
                      price: _price,
                      point: i,
                      ratio,
                    };
                  }
                }
              }
            }
          }
        }
      });

      if (targetItem) {
        itemArr.push(targetItem);
      }
    }

    let lastRes = [];

    let total = 0;

    let bluePrints = {};

    let bluePrintArr = [];

    for (let i = 0; i < itemArr.length; i++) {
      let _count = 0;

      let _name = itemArr[i].name;

      // 跳到后面 n 位
      let j = 0;

      let cost = 0;

      do {
        cost += (itemArr[i + j] || { price: 0 }).price;

        _count = _count + parseFloat((itemArr[i + j] || { ratio: 0 }).ratio);

        j++;
      } while (i + j < itemArr.length && itemArr[i + j].name == _name);

      _count = Math.round(_count);

      const {
        color_level_1,
        color_level_2,
        color_level_3,
        color_level_4,
        reagents,
        preProducedMaterial,
      } = itemArr[i];

      let resItem = null;

      if (itemArr[i + j]) {
        resItem = {
          icon: itemArr[i].icon,
          id: itemArr[i].id,
          name: itemArr[i].name,
          creates: itemArr[i].creates,
          color_level_1,
          color_level_2,
          color_level_3,
          color_level_4,
          start: itemArr[i].point,
          end: itemArr[i + j].point,
          cost,
          quality: itemArr[i].creates?.quality || 0,
          count: _count,
          reagents,
          useCount: 0,
          usedPres: [],
          createCount: (itemArr[i].creates?.count || 1) * (_count || 0),
        };
      } else {
        resItem = {
          icon: itemArr[i].icon,
          id: itemArr[i].id,
          name: itemArr[i].name,
          creates: itemArr[i].creates,
          color_level_1,
          color_level_2,
          color_level_3,
          color_level_4,
          start: itemArr[i].point,
          end: itemArr[itemArr.length - 1].point + 1,
          cost,
          quality: itemArr[i].creates?.quality || 0,
          count: _count,
          reagents,
          useCount: 0,
          usedPres: [],
          createCount: (itemArr[i].creates?.count || 1) * (_count || 0),
        };
      }

      // 统计时，若当前项采用前面路线的某一物品作为材料，且该物品的价格计算方式为非拍卖形式（未卖出），则将该物品部分成本减去，且在该项目中表示该物品及使用数量
      // 为优化计算过程，若不采用本专业物品作为材料，则不进行遍历
      if (preProducedMaterial) {
        preProducedMaterial.forEach((_pre) => {
          let _targetPre = lastRes.find((it) => it.id === _pre.id);

          let _createCount = 0;

          // 非拍卖模式 & 如果数量足够则能用尽用 计算总使用量
          // 判断所使用的材料共提供制作了多少份当前产物的量

          // 计算所节省的成本

          if (
            _targetPre &&
            userConfig.itemsStatus[_targetPre.name].sellType == "merchant"
          ) {
            if (_targetPre.useCount < _targetPre.createCount) {
              let _noUseCount = _targetPre.createCount - _targetPre.useCount;

              if (_noUseCount > _count * _pre.count) {
                _createCount = _count;
              } else {
                _createCount = Math.floor(_noUseCount / _pre.count);
              }

              _targetPre.useCount =
                _targetPre.useCount + _createCount * _pre.count;

              if (_createCount) {
                let _c = _createCount * _pre.count;

                resItem.usedPres = [
                  ...resItem.usedPres,
                  {
                    icon: _targetPre.icon,
                    name: _targetPre.name,
                    count: _createCount * _pre.count,
                  },
                ];

                resItem.cost =
                  resItem.cost - _c * getNeed(_targetPre, true, true).total;
              }
            }
          }
        });
      }

      lastRes.push(resItem);

      // 如果有蓝图，则加入蓝图
      if (!bluePrints[itemArr[i].name] && itemArr[i].bluePrint) {
        let cost = 0;

        let _access = userConfig?.itemsStatus[itemArr[i].name]?.access;

        if (_access == 3) {
          cost = itemArr[i].bluePrint.buy_price || 0;
        }

        if (_access == 4) {
          cost = priceData[itemArr[i].bluePrint.name] || 0;
        }

        bluePrints[itemArr[i].name] = {
          price: cost,
        };

        bluePrintArr.push({
          icon: itemArr[i].bluePrint.icon || "inv_scroll_04",
          name: itemArr[i].bluePrint.name,
          id: itemArr[i].id,
          count: 1,
          bluePrint: true,
          requires_faction: itemArr[i].bluePrint.requires_faction,
          cost,
          access: _access,
          quality: itemArr[i].creates?.quality || 0,
        });

        total += cost;
      }

      total += resItem.cost;

      i = i + j - 1;
    }

    // reagents = reagents.sort((a, b) => a.item_level - b.item_level);

    lastRes.forEach((it) => {
      if (it.reagents) {
        it.reagents.forEach((_reagent) => {
          const _index = reagents.findIndex((it) => it.id === _reagent.id);

          if (_index > -1) {
            reagents[_index].count += _reagent.count * it.count;
          } else {
            if (reagents.length) {
              let i = 0;
              // 排序
              do {
                i++;
              } while (
                i < reagents.length - 1 &&
                reagents[i].item_level < _reagent.item_level
              );

              reagents.splice(i + 1, 0, {
                ..._reagent,
                count: _reagent.count * it.count,
              });
            } else {
              reagents.push({ ..._reagent, count: _reagent.count * it.count });
            }
          }
        });
      }
    });

    lastRes = [...bluePrintArr, ...lastRes];

    reagents = [...bluePrintArr, ...reagents];

    return {
      data: lastRes,
      reagents,
      total,
    };
  };

  const handleCopyMaterialList = () => {
    if (pathData?.reagents) {
      const outputStr = `${professionsTypeArr[userConfig.professionType]}${
        userConfig.start
      }-${userConfig.end}所需材料${pathData.reagents
        .map((_it) => `^"${_it.name}";;;;;;;;;;`)
        .join("")}`;

      materialListEl.current.value = outputStr;

      materialListEl.current.select();

      document.execCommand("copy");

      // alert('已将冲级材料购物清单复制到剪切板');

      setMessages((_prev) => [
        ..._prev,
        <Message
          key={Math.random()}
          type="success"
          duration={3000}
          content="已将冲级材料购物清单复制到剪切板"
        />,
      ]);
    }
  };

  const handleSelectSellPrice = (name, sellType) => () => {
    if (sellType !== userConfig.itemsStatus[name].sellType) {
      setUserConfig((_prevConfig) => {
        const _itemsStatus = { ..._prevConfig.itemsStatus };

        _itemsStatus[name] = {
          ..._itemsStatus[name],
          sellType,
        };

        return {
          ..._prevConfig,
          itemsStatus: _itemsStatus,
        };
      });
    }
  };

  const handleConfigReset = () => {
    setUserConfig({
      start: 1,
      end: 450,
    });

    setPriceData({});

    window.localStorage.setItem("userConfig", JSON.stringify({}));

    window.localStorage.setItem("priceData", JSON.stringify({}));

    window.location.reload();
  };

  const handleWCLBoxClick = () => {
    fetch(`https://wowpro.oss-cn-shanghai.aliyuncs.com/usebox`, {
      method: "HEAD",
    }).catch((error) => console.error("请求失败:", error));

    // 创建一个a标签，用于触发下载
    const link = document.createElement("a");
    link.href = "https://cdn2.newbeebox.com/installer/NewBeeBoxSetup_WPCC.exe"; // 替换成你的文件路径
    link.download = "NewBeeBoxSetup_WPCC.exe"; // 替换成你的文件名和扩展名

    // 模拟点击a标签，触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getReagentPrice = (reagent, pure, safe) => {
    if (reagent.sources && reagent.sources === "merchant") {
      if (pure) {
        return reagent.buy_price || 0;
      }

      return <div>{getPrice(reagent.buy_price)}</div>;
    } else {
      if (priceData[reagent.name]) {
        if (pure) {
          return priceData[reagent.name] || 0;
        }

        return <div>{getPrice(priceData[reagent.name])}</div>;
      } else {
        if (safe) {
          return pure ? 0 : null;
        } else {
          const _item = professionsDataArr[userConfig.professionType].find(
            (_it) => _it.name === reagent.name
          );

          if (pure) {
            return _item ? getNeed(_item, pure, true).total || 0 : 0;
          }

          return _item ? <div>{getNeed(_item, false, true)}</div> : "";
        }
      }
    }
  };

  const handlePathItemClick = (item) => () => {
    const data = professionsDataArr[userConfig.professionType];

    const _index = data.findIndex((it) => it.id === item.id);

    if (_index > -1) {
      const row = document.querySelector(`.row-${_index}`);

      setHighLightItem(item.id);

      row.scrollIntoView({
        block: "center",
        inline: "center",
      });
    }
  };

  const handlePathItemMouseIn = (item, isBluePrint) => () => {
    if (isBluePrint) {
      setHoverItem(null);

      return;
    }

    const {
      color_level_1,
      color_level_2,
      color_level_3,
      color_level_4,
      start,
      end,
    } = item;

    let percentArr = [];

    let stage = 2;

    if (color_level_4 && color_level_2) {
      for (let i = start; i < end; i++) {
        let percent = 1;

        percent = (color_level_4 - i) / (color_level_4 - color_level_2);

        if (percent > 1) {
          percent = 1;
        }

        if (i < color_level_2) {
          stage = 1;
        } else if (color_level_3 && i < color_level_3) {
          stage = 2;
        } else if (i < color_level_4) {
          stage = 3;
        } else if (i === color_level_4) {
          stage = 4;
        }

        stage !== 1 &&
          percentArr.push({
            point: i,
            percent: Math.ceil(100 * percent),
            stage,
          });
      }
    }

    setHoverItem({
      ...item,
      percentArr,
    });
  };

  const handlePathItemMouseOut = () => () => {
    setHoverItem(null);
  };

  const getCreateCount = (createId, max) => {
    const _item = pathData.data.find((it) => it.creates?.id === createId);

    if (_item) {
      const _count = Math.round(_item.count) * _item.creates.count;

      return _count > max ? max : _count;
    } else {
      return 0;
    }
  };

  return (
    <main className="app-main">
      {userConfig.step === 1 || !userConfig.step ? (
        <div className="panel-static" style={{ marginTop: -20 }}>
          <div className="panel-title">请选择专业、服务器、阵营</div>

          <div className="panel-body">
            <div className="config-staic-form">
              <p className="form-label">专业</p>
              <Select
                value={userConfig.professionType}
                className="form-input select-primary"
                placeholder="选择专业"
                data={professionListOptions}
                onChange={(value) => {
                  updateUserConfig("professionType", value);
                }}
              />

              <p className="form-label">服务器</p>

              <Select
                className="form-input select-primary"
                placeholder="选择服务器, 可使用关键字检索"
                data={getServerListOptions()}
                value={userConfig.server}
                search={true}
                onChange={(value) => {
                  updateUserConfig("server", value);
                }}
              />

              <p className="form-label">阵营</p>

              <Select
                className="form-input select-primary"
                placeholder="选择阵营"
                data={sideListOptions}
                value={userConfig.side}
                onChange={(value) => {
                  updateUserConfig("side", value);
                }}
              />
            </div>
          </div>

          <div className="justify-center panel-footer">
            {/* <div className="btn">上一步</div> */}
            <div
              className={
                step1Enabled() ? "btn btn-primary" : "btn btn-disabled"
              }
              onClick={() => {
                //执行一个head请求，地址是https://data.wowplayer.cc/fetch/
                fetch(
                  `https://wowpro.oss-cn-shanghai.aliyuncs.com/step1/${userConfig.professionType}_${userConfig.server}_${userConfig.side}`,
                  { method: "HEAD" }
                ).catch((error) => console.error("请求失败:", error));
                if (step1Enabled()) {
                  updateUserConfig("step", 2);
                }
              }}
            >
              下一步
            </div>
          </div>
        </div>
      ) : null}

      {userConfig.step === 2 ? (
        <div
          className="select-none panel-static panel-price-list"
          style={{ width: 800 }}
        >
          <div className="panel-title">选择价格数据</div>

          {listStatus === "loading" ? (
            <>
              <svg
                className="list-loading"
                fill="#0c8cfa"
                viewBox="0 0 1024 1024"
                width="70"
                height="70"
              >
                <path
                  d="M512.000427 1024c-69.12 0-136.192-13.482667-199.296-40.192a510.293333 510.293333 0 0 1-162.688-109.824A510.293333 510.293333 0 0 1 0.000427 512a35.968 35.968 0 1 1 72.021333 0 439.338667 439.338667 0 0 0 128.896 311.210667A437.717333 437.717333 0 0 0 512.000427 951.978667a439.338667 439.338667 0 0 0 311.210666-128.896A437.717333 437.717333 0 0 0 951.979093 512c0-59.392-11.562667-116.992-34.56-171.306667a440.448 440.448 0 0 0-94.293333-139.904A437.717333 437.717333 0 0 0 512.000427 71.978667 35.968 35.968 0 1 1 512.000427 0c69.12 0 136.192 13.482667 199.296 40.192a510.293333 510.293333 0 0 1 162.688 109.824 511.104 511.104 0 0 1 109.696 162.688c26.709333 63.104 40.234667 130.176 40.234666 199.296s-13.525333 136.192-40.234666 199.296a508.373333 508.373333 0 0 1-109.653334 162.688A511.104 511.104 0 0 1 512.000427 1024z"
                  p-id="22729"
                ></path>
              </svg>
              <p className="tc">加载中...</p>
            </>
          ) : null}

          {listStatus === "ok" ? (
            <>
              <div className="panel-body">
                {/* 价格数据信息 */}

                <div className="config-staic-form" style={{ gridRowGap: 10 }}>
                  <p className="form-label">云端价格数据</p>
                  <ul className={`price-data-list`}>
                    {priceDataList.length ? null : (
                      <div
                        style={{ padding: 10, color: "#666" }}
                        className="tc"
                      >
                        暂无数据
                      </div>
                    )}
                    {priceDataList.map((_data, index) => (
                      <li
                        className="list-item"
                        key={index}
                        onClick={() => {
                          // priceDataList.length && setPriceManual(false);
                        }}
                      >
                        <p>{`${serverList[_data.server].group} ${
                          serverList[_data.server].name
                        }(${serverList[_data.server].type})`}</p>
                        <p>{["联盟", "部落"][_data.side]}</p>
                        <p>
                          {`${professionsTypeArr[_data.profession]}`}
                          {_data.length ? (
                            <span className="tag-count"> {_data.length}项</span>
                          ) : null}
                        </p>
                        <p>{getTimeDesc(_data.time)}</p>

                        {isMy(_data.userId) ? (
                          <div className="tag-self-import">自导入</div>
                        ) : null}

                        <svg
                          fill={_data.isChecked ? "#0c8cfa" : "#ccc"}
                          onClick={() => {
                            setPriceDataList((_prevList) => {
                              const _arr = [..._prevList];
                              _arr.splice(index, 1, {
                                ..._prevList[index],
                                isChecked: !_prevList[index].isChecked,
                              });

                              return _arr;
                            });
                          }}
                          className="price-check-box pointer"
                          viewBox="0 0 1024 1024"
                          width="18"
                          height="18"
                        >
                          <path
                            d="M896 0H128C57.6 0 0 57.6 0 128v768c0 70.4 57.6 128 128 128h768c70.4 0 128-57.6 128-128V128c0-70.4-57.6-128-128-128zM448 794.496l-237.248-237.248 90.496-90.496L448 613.504l306.752-306.752 90.496 90.496L448 794.496z"
                            p-id="12426"
                          ></path>
                        </svg>

                        {_data.status === "loading" ? (
                          <svg
                            className="tag-loading"
                            viewBox="0 0 1024 1024"
                            width="24"
                            height="24"
                            fill={"#0c8cfa"}
                          >
                            <path
                              d="M511.882596 287.998081h-0.361244a31.998984 31.998984 0 0 1-31.659415-31.977309v-0.361244c0-0.104761 0.115598-11.722364 0.115598-63.658399V96.000564a31.998984 31.998984 0 1 1 64.001581 0V192.001129c0 52.586273-0.111986 63.88237-0.119211 64.337537a32.002596 32.002596 0 0 1-31.977309 31.659415zM511.998194 959.99842a31.998984 31.998984 0 0 1-31.998984-31.998984v-96.379871c0-51.610915-0.111986-63.174332-0.115598-63.286318s0-0.242033 0-0.361243a31.998984 31.998984 0 0 1 63.997968-0.314283c0 0.455167 0.11921 11.711527 0.11921 64.034093v96.307622a31.998984 31.998984 0 0 1-32.002596 31.998984zM330.899406 363.021212a31.897836 31.897836 0 0 1-22.866739-9.612699c-0.075861-0.075861-8.207461-8.370021-44.931515-45.094076L195.198137 240.429485a31.998984 31.998984 0 0 1 45.256635-45.253022L308.336112 263.057803c37.182834 37.182834 45.090463 45.253022 45.41197 45.578141A31.998984 31.998984 0 0 1 330.899406 363.021212zM806.137421 838.11473a31.901448 31.901448 0 0 1-22.628318-9.374279L715.624151 760.859111c-36.724054-36.724054-45.018214-44.859267-45.097687-44.93874a31.998984 31.998984 0 0 1 44.77618-45.729864c0.32512 0.317895 8.395308 8.229136 45.578142 45.411969l67.88134 67.88134a31.998984 31.998984 0 0 1-22.624705 54.630914zM224.000113 838.11473a31.901448 31.901448 0 0 0 22.628317-9.374279l67.88134-67.88134c36.724054-36.724054 45.021826-44.859267 45.097688-44.93874a31.998984 31.998984 0 0 0-44.776181-45.729864c-0.32512 0.317895-8.395308 8.229136-45.578142 45.411969l-67.88134 67.884953a31.998984 31.998984 0 0 0 22.628318 54.627301zM255.948523 544.058589h-0.361244c-0.104761 0-11.722364-0.115598-63.658399-0.115598H95.942765a31.998984 31.998984 0 1 1 0-64.00158h95.996952c52.586273 0 63.88237 0.111986 64.337538 0.11921a31.998984 31.998984 0 0 1 31.659414 31.97731v0.361244a32.002596 32.002596 0 0 1-31.988146 31.659414zM767.939492 544.058589a32.002596 32.002596 0 0 1-31.995372-31.666639v-0.361244a31.998984 31.998984 0 0 1 31.659415-31.970085c0.455167 0 11.754876-0.11921 64.34115-0.11921h96.000564a31.998984 31.998984 0 0 1 0 64.00158H831.944685c-51.936034 0-63.553638 0.111986-63.665624 0.115598h-0.335957zM692.999446 363.0176a31.998984 31.998984 0 0 1-22.863126-54.381656c0.317895-0.32512 8.229136-8.395308 45.41197-45.578141l67.88134-67.884953A31.998984 31.998984 0 1 1 828.693489 240.429485l-67.892177 67.88134c-31.020013 31.023625-41.644196 41.759794-44.241539 44.393262l-0.697201 0.722488a31.908673 31.908673 0 0 1-22.863126 9.591025z"
                              p-id="1876"
                            ></path>
                          </svg>
                        ) : null}

                        {_data.status === "ok" ? (
                          <svg
                            className="tag-ok"
                            viewBox="0 0 1024 1024"
                            width="24"
                            height="24"
                            fill={"#0c8cfa"}
                          >
                            <path
                              d="M537 137c165.23 0 302.183 121.067 326.991 279.332C922.626 464.753 960 538.012 960 620c0 145.803-118.197 264-264 264H348c-156.942-0.542-284-127.933-284-285 0-115.73 68.98-215.348 168.067-259.984C282.35 220.296 399.947 137 537 137z m140 357c-10.925-14.296-30.975-17.202-45-7L467.768 609.478c-7.06 5.266-17.05 3.834-22.348-3.203L388 530h-1c-10.533-14.146-30.342-16.765-44-6-14.395 10.384-17.182 30.394-7 44l67.65 89.35c21.226 28.033 61.092 33.693 89.281 12.675L670 538h1c13.357-10.458 16.108-30.192 6-44z"
                              p-id="2566"
                            ></path>
                          </svg>
                        ) : null}

                        {_data.status === "error" ? (
                          <svg
                            className="tag-error"
                            width="24"
                            height="21"
                            viewBox="0 0 175 146"
                            fill={"#ff4500"}
                          >
                            <path
                              fillRule="evenodd"
                              opacity="1"
                              d="M32.83 39.46C13.47 48.17 0 67.63 0 90.23C0 120.91 24.82 145.79 55.47 145.9L123.44 145.9C151.91 145.9 175 122.81 175 94.34C175 78.32 167.7 64.01 156.25 54.56C151.4 23.65 124.65 0 92.38 0C65.61 0 42.65 16.27 32.83 39.46Z M88 90.11L108.61 110.71C109.56 111.65 110.86 112.24 112.29 112.24C115.17 112.24 117.5 109.91 117.5 107.04C117.5 105.6 116.92 104.29 115.97 103.35L95.36 82.74L115.97 62.13C116.92 61.18 117.5 59.88 117.5 58.45C117.5 55.58 115.17 53.24 112.29 53.24C110.86 53.24 109.56 53.82 108.61 54.77L88 75.38L67.39 54.77C66.45 53.82 65.14 53.24 63.71 53.24C60.83 53.24 58.5 55.58 58.5 58.45C58.5 59.88 59.09 61.18 60.03 62.13L80.64 82.74L60.03 103.35C59.09 104.29 58.5 105.6 58.5 107.04C58.5 109.91 60.83 112.24 63.71 112.24C65.14 112.24 66.45 111.65 67.39 110.71L88 90.11Z "
                            />
                          </svg>
                        ) : null}
                      </li>
                    ))}
                  </ul>

                  <div
                    className={`list-item-price flex items-center ${
                      priceManual ? " active" : ""
                    }`}
                  >
                    <p className="label-import">
                      {priceDataList.length
                        ? new Date().getTime() - priceDataList[0].time >
                          172800000
                          ? `当前最新数据为"${getTimeDesc(
                              priceDataList[0].time
                            )}"数据`
                          : ""
                        : "暂无云端数据"}
                    </p>
                    <div
                      className="btn-import"
                      onClick={() => {
                        setPriceManual(true);
                      }}
                    >
                      自行导入数据
                    </div>
                  </div>

                  <p className="form-label"></p>
                  <div className="form-input text-error">
                    * 最终所采用的价格数据，将由所勾选的价格数据综合计算得到
                  </div>
                </div>
              </div>

              <div
                className="justify-between panel-footer"
                style={{ padding: "10px 40px 30px" }}
              >
                {/* <div className="btn">上一步</div> */}
                {/* <div className="btn btn-primary">下一步</div> */}
                <div
                  className="btn"
                  onClick={() => {
                    updateUserConfig("step", 1);
                  }}
                >
                  上一步
                </div>

                <div
                  className={
                    priceDataList.filter((_data) => _data.isChecked).length
                      ? "btn btn-primary"
                      : "btn btn-disabled"
                  }
                  onClick={handleGenUpgradePath}
                >
                  计算冲级路线
                </div>
              </div>
            </>
          ) : null}

          {listStatus === "error" ? (
            <div className="list-error">
              <svg
                className="icon-error"
                viewBox="0 0 1024 1024"
                width="70"
                height="70"
              >
                <path
                  d="M512 512m-448 0a448 448 0 1 0 896 0 448 448 0 1 0-896 0Z"
                  fill="#FA5151"
                  p-id="26075"
                ></path>
                <path
                  d="M557.3 512l113.1-113.1c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L512 466.7 398.9 353.6c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L466.7 512 353.6 625.1c-12.5 12.5-12.5 32.8 0 45.3 6.2 6.2 14.4 9.4 22.6 9.4s16.4-3.1 22.6-9.4L512 557.3l113.1 113.1c6.2 6.2 14.4 9.4 22.6 9.4s16.4-3.1 22.6-9.4c12.5-12.5 12.5-32.8 0-45.3L557.3 512z"
                  fill="#FFFFFF"
                  p-id="26076"
                ></path>
              </svg>
              <p className="tc">
                数据加载失败...
                <span
                  className="text-primary pointer"
                  onClick={loadPriceDataList}
                >
                  重试
                </span>
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {userConfig.step === 3 ? (
        <div className="panel-main">
          <div className="panel-header">
            <div className="logo" />

            <p className="header-title">魔兽世界WLK专业技能冲级宝典</p>

            <div className="header-config-wrap">
              <div className="flex items-center" style={{ color: "#ff44a3" }}>
                <div className="icon-wrap">
                  <img className="icon" src={ImgServer} />
                </div>
                {
                  getServerListOptions().find(
                    (_it) => _it.value === userConfig.server
                  ).key
                }
              </div>
              <div
                className={`${
                  userConfig.side === 0 ? "text-primary " : "text-error "
                }flex items-center`}
              >
                <div className="icon-wrap">
                  <img
                    className="icon"
                    src={userConfig.side === 0 ? ImgLianMeng : ImgBuLuo}
                  />
                </div>
                {
                  sideListOptions.find((_it) => _it.value === userConfig.side)
                    .key
                }
              </div>
              <div className="flex items-center text-success">
                <div className="icon-wrap">
                  <img
                    className="icon"
                    src={`./resources/wlk/icons/medium/${
                      professionListOptions.find(
                        (_it) => _it.value === userConfig.professionType
                      ).icon
                    }.jpg`}
                  />
                </div>
                {
                  professionListOptions.find(
                    (_it) => _it.value === userConfig.professionType
                  ).key
                }
              </div>
            </div>

            <div
              className="btn btn-primary"
              style={{
                height: 30,
                lineHeight: "28px",
                padding: "0 10px",
                fontSize: 12,
              }}
              onClick={handleConfigReset}
            >
              修改服务器和专业
            </div>

            <div
              className="contact-wrap"
              style={{ marginLeft: "50px", display: "none" }}
            >
              <input
                className="contact-title pointer"
                defaultValue="低价手工代冲"
              />

              <div className="contact-panel">
                <div>
                  作者亲自手工代冲工程，价格优惠，有需要可扫描加微信好友。
                </div>
                <div className="qrcode"></div>
              </div>
            </div>

            <div
              className="btn btn-success"
              style={{
                height: 30,
                lineHeight: "28px",
                marginLeft: "50px",
                padding: "0 10px",
                fontSize: 12,
              }}
              onClick={handleWCLBoxClick}
            >
              下载新手盒子客户端，获取更多黑科技
            </div>
          </div>

          <div className="flex panel-body">
            <div className="overflow-auto price-table-wrap h-100">
              <div className="price-table">
                <div className="table-header">
                  <div className="table-col">名称</div>
                  <div className="table-col">制造材料/单价</div>
                  <div className="table-col">点数</div>
                  <div className="table-col">生产成本/单次</div>
                  <div className="table-col">
                    售价/单价 <span className="text-success">选择出售方式</span>
                  </div>
                  {/* <div className="table-col">售价/单价</div> */}
                  <div className="table-col">实际成本/单次</div>
                  <div className="table-col">
                    图纸 <span className="text-success">选择获取方式</span>
                  </div>
                  {/* <div className="table-col">启用</div> */}
                </div>

                {professionsDataArr[userConfig.professionType].map(
                  (item, index) => (
                    <div
                      key={item.id}
                      className={`table-row row-${index} ${
                        pathData?.data?.find((_it) => _it.id === item.id)
                          ? " active"
                          : ""
                      } ${highLightItem === item.id ? " high-light" : ""}`}
                    >
                      <div className="flex items-center table-col">
                        <div className="icon-wrap lg">
                          <img
                            className="icon"
                            src={`./resources/wlk/icons/medium/${item.icon}.jpg`}
                          />
                          {item.creates && item.creates.count > 1 ? (
                            <div className="tag-count">
                              {item.creates.count}
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                        <p
                          className="item-name"
                          style={{
                            whiteSpace: "initial",
                            color: [
                              "#fff",
                              "#fff",
                              "#1eff00",
                              "#0070dd",
                              "#a335ee",
                              "#ff8000",
                            ][item.creates?.quality || 0],
                          }}
                        >
                          {item.name}
                        </p>
                      </div>
                      <div className="flex justify-center table-col flex-column">
                        {item.reagents.map((reagent) => (
                          <div key={reagent.id} className="flex item-reagent">
                            <ItemWithTip
                              tip={reagent.name}
                              color={
                                [
                                  "#fff",
                                  "#fff",
                                  "#1eff00",
                                  "#0070dd",
                                  "#a335ee",
                                  "#ff8000",
                                ][reagent.quality || 0]
                              }
                            >
                              <div
                                className="icon-wrap"
                                style={{ marginRight: 5 }}
                              >
                                <img
                                  className="icon"
                                  src={`./resources/wlk/icons/medium/${reagent.icon}.jpg`}
                                />

                                {reagent.sources &&
                                reagent.sources === "merchant" ? (
                                  <span className="sell-tag"></span>
                                ) : (
                                  ""
                                )}

                                {reagent.count > 1 ? (
                                  <div className="tag-count">
                                    {reagent.count}
                                  </div>
                                ) : (
                                  ""
                                )}
                              </div>
                            </ItemWithTip>

                            {priceData ? getReagentPrice(reagent) : null}
                          </div>
                        ))}
                      </div>
                      <div className="table-col col-points">
                        <span className="point">
                          {item.color_level_1 || ""}
                        </span>
                        <span className="point">{item.color_level_2}</span>
                        <span className="point">{item.color_level_3}</span>
                        <span className="point">{item.color_level_4}</span>
                      </div>
                      <div className="flex items-center table-col">
                        {/* {
                      priceData ? <div>{item.reagents ? getNeed(item) || '' : ''}</div> : ''
                    } */}

                        {userConfig?.itemsStatus &&
                        userConfig?.itemsStatus[item.name]?.pdCost &&
                        !userConfig.itemsStatus[item.name].pdCost.isMiss ? (
                          <>
                            {getPrice(
                              userConfig.itemsStatus[item.name].pdCost.total
                            )}
                          </>
                        ) : null}
                      </div>
                      <div className="flex justify-center table-col flex-column">
                        {/* 拍卖售价 */}
                        {priceData &&
                        item.creates &&
                        priceData[
                          item.name.indexOf("附魔") === 0
                            ? `卷轴：${item.name}`
                            : item.creates.name
                        ] ? (
                          <div
                            className={`item-price-content${
                              userConfig?.itemsStatus[item.name].sellType ===
                              "auction"
                                ? " active"
                                : ""
                            }`}
                            onClick={handleSelectSellPrice(
                              item.name,
                              "auction"
                            )}
                          >
                            <p className="price-tag">拍卖</p>
                            {getPrice(
                              priceData[
                                item.name.indexOf("附魔") === 0
                                  ? `卷轴：${item.name}`
                                  : item.creates.name
                              ]
                            )}
                          </div>
                        ) : (
                          ""
                        )}

                        {item.creates?.sell_price ? (
                          <div
                            className={`item-price-content${
                              userConfig?.itemsStatus[item.name].sellType ===
                              "merchant"
                                ? " active"
                                : ""
                            }`}
                            onClick={handleSelectSellPrice(
                              item.name,
                              "merchant"
                            )}
                          >
                            <p className="price-tag spec">卖店</p>
                            {getPrice(item.creates.sell_price)}
                          </div>
                        ) : (
                          ""
                        )}
                      </div>

                      <div className="flex items-center table-col">
                        {/* 实际成本 */}
                        {/* {getActualCost(item)} */}

                        {userConfig?.itemsStatus[item.name]?.sellType ===
                          "auction" &&
                        userConfig.itemsStatus[item.name].acCostAuc &&
                        !userConfig.itemsStatus[item.name].acCostAuc.isMiss
                          ? getPrice(
                              userConfig.itemsStatus[item.name].acCostAuc.total
                            )
                          : null}

                        {userConfig?.itemsStatus[item.name].sellType ===
                          "merchant" &&
                        userConfig.itemsStatus[item.name].acCostMer &&
                        !userConfig.itemsStatus[item.name].acCostMer.isMiss
                          ? getPrice(
                              userConfig.itemsStatus[item.name].acCostMer.total
                            )
                          : null}
                      </div>

                      <div className="flex justify-center table-col flex-column">
                        {/* 图纸来源 */}

                        {/* <select
                      className="source-type-select"
                      value={userConfig?.itemsStatus[item.name].access}
                      disabled={item.isDisabled}
                      onChange={
                        handleAccessChange(item.name)
                      }>
                      {
                        item.sourcesType.map(_type => <option key={_type} value={_type} >{((item.sourcesType.length > 2 ? ['', '已获得', '禁用', 'NPC购买', '拍卖行购买'] : ['', '启用', '禁用']))[_type]}</option>)
                      }
                    </select> */}

                        {/* {
                      !item.isDisabled ? <div className="sources-wrap" >
                        <p className={`sources-title type-1 ${userConfig?.itemsStatus[item.name].access == 1 ? 'active' : ''}`} onClick={() => {
                          handleAccessChange(item.name, 1, item.isDisabled)
                        }} >{item.bluePrint ? '自有' : '启用'}</p>
                      </div> : (item.bluePrint ? <div className="sources-wrap" >
                        <p className={`sources-title type-1 ${userConfig?.itemsStatus[item.name].access == 1 ? 'active' : ''}`} onClick={() => {
                          handleAccessChange(item.name, 1, item.isDisabled)
                        }} >自有</p>
                      </div> : null)
                    } */}

                        {!item.isDisabled && !item.bluePrint ? (
                          <div className="sources-wrap">
                            <p
                              className={`sources-title type-1 ${
                                userConfig?.itemsStatus[item.name].access == 1
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() => {
                                handleAccessChange(
                                  item.name,
                                  1,
                                  item.isDisabled
                                );
                              }}
                            >
                              训练师
                            </p>
                          </div>
                        ) : null}

                        {item.bluePrint?.sources
                          ? genSources(item.bluePrint.sources, item)
                          : null}

                        {item.bluePrint?.name ? (
                          <div className="sources-wrap">
                            <p
                              className={`sources-title type-4 ${
                                userConfig?.itemsStatus[item.name].access == 4
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() => {
                                handleAccessChange(
                                  item.name,
                                  4,
                                  item.isDisabled
                                );
                              }}
                            >
                              拍卖&nbsp;&nbsp;
                              {priceData[item.bluePrint.name] ? (
                                getPrice(priceData[item.bluePrint.name])
                              ) : (
                                <span className="text-error">缺失</span>
                              )}
                            </p>
                          </div>
                        ) : null}

                        <div className="sources-wrap">
                          <p
                            className={`sources-title type-2 ${
                              userConfig?.itemsStatus[item.name].access == 2
                                ? "active"
                                : ""
                            }`}
                            onClick={() => {
                              handleAccessChange(item.name, 2, item.isDisabled);
                            }}
                          >
                            禁用
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            {pathData ? (
              <>
                <div className="path-wrap normal">
                  <div className="flex items-center wrap-title">
                    <div className="fs-16">升级路线</div>
                    <input
                      min="1"
                      max="449"
                      type="number"
                      className="input-point"
                      value={userConfig.start}
                      onChange={(e) => {
                        updateUserConfig("start", e.target.value);
                      }}
                    />{" "}
                    至{" "}
                    <input
                      min="2"
                      max="450"
                      type="number"
                      className="input-point"
                      value={userConfig.end}
                      onChange={(e) => {
                        updateUserConfig("end", e.target.value);
                      }}
                    />
                  </div>

                  {pathData.errorMessage ? (
                    <div className="path-error-msg">
                      {pathData.errorMessage}
                    </div>
                  ) : (
                    <>
                      <div
                        className="flex items-center justify-between"
                        style={{ paddingLeft: 5, paddingRight: 5 }}
                      >
                        <div className="subtitle">
                          共花费 {getPrice(Math.round(pathData.total))}
                        </div>
                        {materialModalShow ? null : (
                          <div
                            className="btn-material pointer text-success"
                            onClick={() => {
                              setMaterialModalShow(true);
                            }}
                          >
                            查看材料清单&gt;&gt;
                          </div>
                        )}
                      </div>

                      <div className="path-content">
                        <div className="path-header">
                          <div className="path-col">名称</div>
                          <div className="path-col">技能点数</div>
                          <div className="path-col">次/制/用</div>

                          <div className="path-col">花费</div>
                        </div>
                        {pathData.data.map((_item, index) => (
                          <div
                            key={index}
                            className="path-row"
                            onClick={handlePathItemClick(_item)}
                            onMouseEnter={handlePathItemMouseIn(
                              _item,
                              _item.bluePrint
                            )}
                            onMouseLeave={handlePathItemMouseOut()}
                          >
                            <div className="path-col">
                              <div className="icon-wrap">
                                <img
                                  className="icon"
                                  src={`./resources/wlk/icons/medium/${_item.icon}.jpg`}
                                />
                              </div>
                              <div
                                className="item-name flex-grow-1"
                                style={{
                                  color: [
                                    "#fff",
                                    "#fff",
                                    "#1eff00",
                                    "#0070dd",
                                    "#a335ee",
                                    "#ff8000",
                                  ][_item.quality || 0],
                                }}
                              >
                                {_item.name}
                              </div>
                            </div>

                            <div className="path-col">
                              {_item.bluePrint ? (
                                <span>数量 1</span>
                              ) : (
                                <>
                                  {_item.start} ~ {_item.end}
                                </>
                              )}
                            </div>

                            <div className="path-col text-success ">
                              {!_item.bluePrint ? (
                                <div>
                                  <div className="col-item-count">
                                    {_item.count} 次
                                  </div>
                                  <div className="col-item-create">
                                    {_item.createCount}个
                                  </div>
                                  <div
                                    className={
                                      _item.useCount ? "col-item-use" : "dn"
                                    }
                                  >
                                    <span>{_item.useCount}</span>用
                                  </div>
                                </div>
                              ) : null}
                            </div>

                            <div className="flex-wrap path-col">
                              <div>
                                {!_item.bluePrint && _item.cost ? (
                                  <div>
                                    <div>
                                      {getPrice(Math.round(_item.cost))}
                                    </div>
                                    {_item.usedPres.map((_pre) => (
                                      <div
                                        key={_pre.name}
                                        className="text-error"
                                        style={{ lineHeight: 1.2 }}
                                      >
                                        + {_pre.name}*{_pre.count}
                                      </div>
                                    ))}
                                  </div>
                                ) : null}

                                {_item.bluePrint ? (
                                  <>
                                    {_item.access == 3 || _item.access == 4 ? (
                                      _item.cost ? (
                                        getPrice(Math.round(_item.cost))
                                      ) : (
                                        <span className="text-error">
                                          缺失&nbsp;
                                        </span>
                                      )
                                    ) : null}

                                    {_item.access == 5 ? (
                                      <span className="text-success">
                                        掉落\任务或其它&nbsp;
                                      </span>
                                    ) : null}

                                    {_item.access == 4 ? (
                                      <span className="tag-merchant error">
                                        拍卖
                                      </span>
                                    ) : null}

                                    {_item.access == 3 ? (
                                      <span className="tag-merchant primary">
                                        NPC
                                      </span>
                                    ) : null}
                                  </>
                                ) : null}
                              </div>

                              {_item.access == 3 && _item.requires_faction ? (
                                <div className="w-100 tag-faction">
                                  {_item.requires_faction.name}&nbsp;&nbsp;
                                  {
                                    reputationMap[
                                      _item.requires_faction.reputation_id
                                    ]
                                  }
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {materialModalShow ? (
                  <div className="path-wrap spec">
                    <div className="flex items-center justify-between wrap-title">
                      <div className="fs-16">
                        材料清单&nbsp;&nbsp;
                        <span
                          className="fs-14 text-primary pointer"
                          onClick={handleCopyMaterialList}
                        >
                          [复制]
                        </span>
                      </div>

                      <svg
                        onClick={() => {
                          setMaterialModalShow(false);
                        }}
                        className="pointer"
                        viewBox="0 0 1024 1024"
                        width="20"
                        height="20"
                      >
                        <path
                          d="M557.312 513.248l265.28-263.904c12.544-12.48 12.608-32.704 0.128-45.248-12.512-12.576-32.704-12.608-45.248-0.128l-265.344 263.936-263.04-263.84C236.64 191.584 216.384 191.52 203.84 204 191.328 216.48 191.296 236.736 203.776 249.28l262.976 263.776L201.6 776.8c-12.544 12.48-12.608 32.704-0.128 45.248 6.24 6.272 14.464 9.44 22.688 9.44 8.16 0 16.32-3.104 22.56-9.312l265.216-263.808 265.44 266.24c6.24 6.272 14.432 9.408 22.656 9.408 8.192 0 16.352-3.136 22.592-9.344 12.512-12.48 12.544-32.704 0.064-45.248L557.312 513.248z"
                          p-id="2272"
                          fill="#ccc"
                        ></path>
                      </svg>
                    </div>

                    {pathData.errorMessage ? (
                      <div className="path-error-msg">
                        {pathData.errorMessage}
                      </div>
                    ) : (
                      <>
                        <div className="path-content spec">
                          <div className="path-header">
                            <div className="path-col">名称</div>
                            <div className="path-col">数量</div>

                            <div className="path-col">花费</div>
                          </div>

                          {pathData.reagents.map((_item, index) => (
                            <div
                              key={index}
                              className={`path-row ${
                                _item.bluePrint ? "blue-print" : ""
                              }`}
                              onClick={() => {
                                _item.bluePrint && handlePathItemClick(_item)();
                              }}
                            >
                              <div className="path-col">
                                <div className="icon-wrap">
                                  <img
                                    className="icon"
                                    src={`./resources/wlk/icons/medium/${_item.icon}.jpg`}
                                  />
                                  {_item.sources &&
                                  _item.sources === "merchant" ? (
                                    <span className="sell-tag"></span>
                                  ) : (
                                    ""
                                  )}
                                </div>
                                <div
                                  className="item-name flex-grow-1"
                                  style={{
                                    color: [
                                      "#fff",
                                      "#fff",
                                      "#1eff00",
                                      "#0070dd",
                                      "#a335ee",
                                      "#ff8000",
                                    ][_item.quality || 0],
                                  }}
                                >
                                  {_item.name}
                                </div>
                              </div>

                              <div className="path-col">
                                {Math.round(_item.count) -
                                  getCreateCount(
                                    _item.id,
                                    Math.round(_item.count)
                                  )}
                              </div>

                              <div className="flex-wrap path-col">
                                <div>
                                  {!_item.bluePrint
                                    ? getPrice(
                                        getReagentPrice(_item, true, true) *
                                          (Math.round(_item.count) -
                                            getCreateCount(
                                              _item.id,
                                              Math.round(_item.count)
                                            ))
                                      )
                                    : null}

                                  {_item.bluePrint ? (
                                    <>
                                      {_item.access == 3 ||
                                      _item.access == 4 ? (
                                        _item.cost ? (
                                          getPrice(Math.round(_item.cost))
                                        ) : (
                                          <span className="text-error">
                                            缺失&nbsp;
                                          </span>
                                        )
                                      ) : null}

                                      {_item.access == 5 ? (
                                        <span className="text-success">
                                          掉落\任务或其它&nbsp;
                                        </span>
                                      ) : null}

                                      {_item.access == 4 ? (
                                        <span className="tag-merchant error">
                                          拍卖
                                        </span>
                                      ) : null}

                                      {_item.access == 3 ? (
                                        <span className="tag-merchant primary">
                                          NPC
                                        </span>
                                      ) : null}
                                    </>
                                  ) : null}
                                </div>

                                {_item.access == 3 && _item.requires_faction ? (
                                  <div className="w-100 tag-faction">
                                    {_item.requires_faction.name}&nbsp;&nbsp;
                                    {
                                      reputationMap[
                                        _item.requires_faction.reputation_id
                                      ]
                                    }
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {priceManual ? (
        <div className="modal-mask">
          <div className="panel-static" style={{ width: 720 }}>
            <div className="panel-title">
              自行导入数据
              <div
                className="icon-close"
                onClick={() => {
                  setPriceManual(false);
                }}
              />
            </div>
            <div className="panel-body">
              <p className="process-label">导入过程演示</p>
              <div className={`import-process-wrap `}>
                <ul className="process-list">
                  <li
                    className={`process-item${
                      processIndex === 1 ? " active" : ""
                    }`}
                    onClick={() => {
                      setProcessIndex(1);
                      setProcessStop(true);
                    }}
                  >
                    1.复制购物清单
                  </li>
                  <li
                    className={`process-item${
                      processIndex === 2 ? " active" : ""
                    }`}
                    onClick={() => {
                      setProcessIndex(2);
                      setProcessStop(true);
                    }}
                  >
                    2.安装Auctionator插件
                  </li>
                  <li
                    className={`process-item${
                      processIndex === 3 ? " active" : ""
                    }`}
                    onClick={() => {
                      setProcessIndex(3);
                      setProcessStop(true);
                    }}
                  >
                    3.进入游戏
                  </li>
                  <li
                    className={`process-item${
                      processIndex === 4 ? " active" : ""
                    }`}
                    onClick={() => {
                      setProcessIndex(4);
                      setProcessStop(true);
                    }}
                  >
                    4.打开拍卖行
                  </li>
                  <li
                    className={`process-item${
                      processIndex === 5 ? " active" : ""
                    }`}
                    onClick={() => {
                      setProcessIndex(5);
                      setProcessStop(true);
                    }}
                  >
                    5.切换到购物面板
                  </li>
                  <li
                    className={`process-item${
                      processIndex === 6 ? " active" : ""
                    }`}
                    onClick={() => {
                      setProcessIndex(6);
                      setProcessStop(true);
                    }}
                  >
                    6.点击导入
                  </li>
                  <li
                    className={`process-item${
                      processIndex === 7 ? " active" : ""
                    }`}
                    onClick={() => {
                      setProcessIndex(7);
                      setProcessStop(true);
                    }}
                  >
                    7.粘贴购物清单
                  </li>
                  <li
                    className={`process-item${
                      processIndex === 8 ? " active" : ""
                    }`}
                    onClick={() => {
                      setProcessIndex(8);
                      setProcessStop(true);
                    }}
                  >
                    8.点击搜索
                  </li>
                  <li
                    className={`process-item${
                      processIndex === 9 ? " active" : ""
                    }`}
                    onClick={() => {
                      setProcessIndex(9);
                      setProcessStop(true);
                    }}
                  >
                    9.等待商品扫描
                  </li>
                  <li
                    className={`process-item${
                      processIndex === 10 ? " active" : ""
                    }`}
                    onClick={() => {
                      setProcessIndex(10);
                      setProcessStop(true);
                    }}
                  >
                    10.点击导出结果
                  </li>
                  <li
                    className={`process-item${
                      processIndex === 11 ? " active" : ""
                    }`}
                    onClick={() => {
                      setProcessIndex(11);
                      setProcessStop(true);
                    }}
                  >
                    11.导入价格数据
                  </li>
                </ul>

                <div className={`process-img-panel process-${processIndex}`} />
              </div>
            </div>

            <div className="justify-between panel-footer">
              <div className="btn btn-primary" onClick={genShoppingList}>
                复制购物清单
              </div>
              <div
                className="btn btn-success"
                onClick={() => {
                  setImportModalShow(true);
                }}
              >
                扫描完成，导入价格数据
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {importModalShow ? (
        <div className="modal-mask">
          <div className="panel-static">
            <div className="panel-title">导入价格数据</div>

            <div className="panel-body" style={{ padding: 20 }}>
              <textarea
                className="price-copy-input"
                placeholder="粘贴插件所导出的价格数据"
                rows={20}
                value={importDataStr}
                onChange={(e) => {
                  setImportDataStr(e.target.value);
                }}
              />
            </div>

            <div className="justify-between panel-footer">
              <div
                className="btn"
                onClick={() => {
                  setImportModalShow(false);
                  setImportDataStr("");
                }}
              >
                取消
              </div>

              <div className="btn btn-primary" onClick={handleImportPriceData}>
                确定
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div
        className={`probability-panel ${materialModalShow ? "spec" : ""} ${
          hoverItem ? "" : " dn"
        }`}
      >
        <div
          className="flex justify-between probability-title"
          style={{
            color: ["#fff", "#fff", "#1eff00", "#0070dd", "#a335ee", "#ff8000"][
              hoverItem?.quality || 0
            ],
          }}
        >
          {hoverItem?.name}
        </div>
        <div className="probability-points">
          <span>
            {hoverItem?.color_level_1 || hoverItem?.color_level_1 === 0 ? (
              <>{hoverItem?.color_level_1}&nbsp;&nbsp;</>
            ) : null}
          </span>
          <span>
            {hoverItem?.color_level_2 || hoverItem?.color_level_2 === 0 ? (
              <>{hoverItem?.color_level_2}&nbsp;&nbsp;</>
            ) : null}
          </span>
          <span>
            {hoverItem?.color_level_3 || hoverItem?.color_level_3 === 0 ? (
              <>{hoverItem?.color_level_3}&nbsp;&nbsp;</>
            ) : null}
          </span>
          <span>{hoverItem?.color_level_4}</span>
        </div>
        <div>
          <div>等级 涨点概率 预估次数</div>
          <ul
            className={`probability-list ${
              hoverItem?.percentArr.length < 19 ? "spec" : ""
            }`}
            style={{
              gridTemplateRows: `repeat(${Math.round(
                hoverItem?.percentArr.length / 2
              )}, 1fr)`,
            }}
          >
            {hoverItem?.start < hoverItem?.color_level_2 ? (
              <li className="list-item stage-1">
                <span className="point">
                  {hoverItem?.start} ~{" "}
                  {Math.min(hoverItem?.end, hoverItem?.color_level_2) - 1}
                </span>
                100%
                <span className="count">1次</span>
              </li>
            ) : null}
            {hoverItem?.percentArr.map((_it) => (
              <li className={`list-item stage-${_it.stage}`} key={_it.point}>
                <span className="point">{_it.point}</span>
                {_it.percent}%
                <span className="count">{Math.round(100 / _it.percent)}次</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`loading-global-wrap ${loadingGlobal ? "" : "dn"}`}>
        <div className="flex items-center justify-center inner">
          <div className="icon-loading" />
          <div>正在计算最佳路线</div>
        </div>
      </div>

      <textarea
        className="copy-input"
        height={0}
        ref={shoppingListEl}
      ></textarea>

      <textarea
        className="copy-input"
        height={0}
        ref={materialListEl}
      ></textarea>

      {messages}
    </main>
  );
};

export default App;
