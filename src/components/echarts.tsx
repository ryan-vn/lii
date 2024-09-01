import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";
import { increment, decrement } from "../store/slice/counterSlice";
import { Button } from "antd";

const mockItemId = 43102;

const EChartsComponent = () => {
  const chartRef = useRef(null);
  const [data, setData] = useState([]);
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  useEffect(() => {
    axios
      .get(`http://localhost:3000/auction-history/29/1/${mockItemId}`)
      .then((res) => {
        setData(res.data);
      });
  }, []);

  const buildTooltipContent = (item) => {
    console.log("item", item);
    return `
      TSM4最后更新数据时间: ${item.scanTime}<br />
      最低价格: ${item.minPrice / 10000}<br />
      平均价格: ${item.avePrice / 10000}<br />
      拍卖数量: ${item.auctionNum}<br />
      物品数量: ${item.quantity}
    `;
  };

  useEffect(() => {
    if (data.length > 0) {
      const uniqueDataMap = new Map();

      // 遍历数据，以scanTime为键，数据点为值
      data.forEach((item) => {
        console.log(item.scanTime);
        uniqueDataMap.set(item.scanTime, item);
      });

      // 从映射中提取数据
      const uniqueData = Array.from(uniqueDataMap.values());

      const myChart = echarts.init(chartRef.current);

      const scanTimes = uniqueData.map((data) => {
        const date = new Date(data.scanTime);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          "0"
        )}-${String(date.getDate()).padStart(2, "0")} ${String(
          date.getHours()
        ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
      });

      const minPrices = uniqueData.map((item) => item.minPrice / 10000);
      const avePrices = uniqueData.map((item) => item.avePrice / 10000);
      const quantities = uniqueData.map((item) => item.quantity);

      const option = {
        tooltip: {
          trigger: "axis",
        },
        legend: {
          data: ["最小价格", "平均价格", "物品数量"],
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: scanTimes,
          axisLabel: {
            formatter: function (value) {
              return echarts.format.formatTime(
                "yyyy-MM-dd hh:mm",
                new Date(value)
              );
            },
          },
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            name: "最小价格",
            type: "line",
            stack: "Total",
            data: minPrices,
          },
          {
            name: "平均价格",
            type: "line",
            stack: "Total",
            data: avePrices,
          },
          // {
          //   name: "物品数量",
          //   type: "line",
          //   stack: "Total",
          //   data: quantities,
          // },
        ],
      };
      myChart.setOption(option);
      const handleResize = () => {
        myChart.resize();
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        myChart.dispose(); // 销毁图表实例
      };
    }
  }, [data]);

  return (
    <>
      <h1>{mockItemId}</h1>
      <div>{count}</div>
      <Button onClick={() => dispatch(increment())}>+</Button>
      <div ref={chartRef} style={{ width: "100%", height: "400px" }}></div>
    </>
  );
};

export default EChartsComponent;
