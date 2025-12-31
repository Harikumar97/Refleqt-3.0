/**
 * Competitive Chart Component
 * Visualize competitor positioning and insights using Chart.js
 */

"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import type { CohortInsight } from "@/lib/strategy-cohorts/types";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface CompetitiveChartProps {
  insights: CohortInsight[];
  type?: "category" | "confidence";
}

export default function CompetitiveChart({
  insights,
  type = "category",
}: CompetitiveChartProps) {
  if (insights.length === 0) {
    return (
      <div className="chart-empty">
        <style jsx>{`
          .chart-empty {
            background: white;
            border-radius: 16px;
            padding: 48px 24px;
            text-align: center;
          }

          .empty-text {
            font-size: 14px;
            color: #9ca3af;
          }
        `}</style>

        <div className="empty-text">No data available for visualization</div>
      </div>
    );
  }

  // Prepare data based on chart type
  const prepareData = () => {
    if (type === "category") {
      // Count insights by category
      const categoryCounts = insights.reduce(
        (acc, insight) => {
          acc[insight.category] = (acc[insight.category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        labels: Object.keys(categoryCounts),
        datasets: [
          {
            label: "Insights by Category",
            data: Object.values(categoryCounts),
            backgroundColor: [
              "rgba(240, 147, 251, 0.6)",
              "rgba(245, 87, 108, 0.6)",
              "rgba(16, 185, 129, 0.6)",
              "rgba(245, 158, 11, 0.6)",
              "rgba(99, 102, 241, 0.6)",
            ],
            borderColor: [
              "rgba(240, 147, 251, 1)",
              "rgba(245, 87, 108, 1)",
              "rgba(16, 185, 129, 1)",
              "rgba(245, 158, 11, 1)",
              "rgba(99, 102, 241, 1)",
            ],
            borderWidth: 2,
          },
        ],
      };
    } else {
      // Count insights by confidence
      const confidenceCounts = insights.reduce(
        (acc, insight) => {
          acc[insight.confidence] = (acc[insight.confidence] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        labels: ["High", "Medium", "Low"],
        datasets: [
          {
            label: "Insights by Confidence",
            data: [
              confidenceCounts["high"] || 0,
              confidenceCounts["medium"] || 0,
              confidenceCounts["low"] || 0,
            ],
            backgroundColor: [
              "rgba(16, 185, 129, 0.6)",
              "rgba(245, 158, 11, 0.6)",
              "rgba(239, 68, 68, 0.6)",
            ],
            borderColor: [
              "rgba(16, 185, 129, 1)",
              "rgba(245, 158, 11, 1)",
              "rgba(239, 68, 68, 1)",
            ],
            borderWidth: 2,
          },
        ],
      };
    }
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text:
          type === "category"
            ? "Insights by Category"
            : "Insights by Confidence Level",
        font: {
          size: 16,
          weight: "700",
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="competitive-chart">
      <style jsx>{`
        .competitive-chart {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          height: 350px;
        }

        .chart-container {
          height: 100%;
          width: 100%;
        }
      `}</style>

      <div className="chart-container">
        <Bar data={prepareData()} options={options} />
      </div>
    </div>
  );
}
