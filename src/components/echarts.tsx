import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import axios from "axios";

const EChartsComponent = () => {
  const chartRef = useRef(null);
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/auction-history/14971").then((res) => {
      setData(res.data);
    });
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      const uniqueDataMap = new Map();

      // 遍历数据，以scanTime为键，数据点为值
      data.forEach((item) => {
        uniqueDataMap.set(item.scanTime, item);
      });

      // 从映射中提取数据
      const uniqueData = Array.from(uniqueDataMap.values());

      const myChart = echarts.init(chartRef.current);
      const scanTimes = uniqueData.map((item) => item.scanTime);
      const minPrices = uniqueData.map((item) => item.minPrice / 1000);
      const avePrices = uniqueData.map((item) => item.avePrice / 1000);
      const quantities = uniqueData.map((item) => item.quantity);

      const option = {
        tooltip: {
          trigger: "axis",
          formatter: function (params) {
            const dataIndex = params[0].dataIndex;
            const item = data[dataIndex];
            return `
              TSM4最后更新数据时间: ${item.scanTime}<br />
              最低价格: ${item.minPrice / 1000}<br />
              平均价格: ${item.avePrice / 1000}<br />
              拍卖数量: ${item.auctionNum}<br />
              物品数量: ${item.quantity}
            `;
          },
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
              return echarts.format.formatTime("MM-dd hh:mm", new Date(value));
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
          {
            name: "物品数量",
            type: "line",
            stack: "Total",
            data: quantities,
          },
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

  return <div ref={chartRef} style={{ width: "100%", height: "400px" }}></div>;
};

export default EChartsComponent;
