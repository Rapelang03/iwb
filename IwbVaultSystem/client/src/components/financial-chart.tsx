import { useEffect, useRef } from "react";
import { IncomeStatement } from "@shared/schema";
import { Chart, registerables } from "chart.js";
import { format } from "date-fns";

// Register Chart.js components
Chart.register(...registerables);

interface FinancialChartProps {
  incomeStatements: IncomeStatement[];
}

export default function FinancialChart({ incomeStatements }: FinancialChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current || incomeStatements.length === 0) return;

    // Clean up previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Sort statements by date (year and month)
    const sortedStatements = [...incomeStatements].sort((a, b) => {
      const dateA = new Date(a.year, a.month - 1, 1);
      const dateB = new Date(b.year, b.month - 1, 1);
      return dateA.getTime() - dateB.getTime();
    });

    // Prepare data for chart
    const labels = sortedStatements.map(statement => {
      const date = new Date(statement.year, statement.month - 1, 1);
      return format(date, "MMM yyyy");
    });

    const revenueData = sortedStatements.map(statement => statement.totalRevenue / 100);
    const expensesData = sortedStatements.map(statement => statement.totalExpenses / 100);
    const profitData = sortedStatements.map(statement => statement.netProfit / 100);

    // Create chart
    const ctx = chartRef.current.getContext("2d");
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Revenue",
            data: revenueData,
            backgroundColor: "rgba(37, 99, 235, 0.5)",
            borderColor: "rgba(37, 99, 235, 1)",
            borderWidth: 1,
          },
          {
            label: "Expenses",
            data: expensesData,
            backgroundColor: "rgba(239, 68, 68, 0.5)",
            borderColor: "rgba(239, 68, 68, 1)",
            borderWidth: 1,
          },
          {
            type: "line",
            label: "Net Profit",
            data: profitData,
            borderColor: "rgba(16, 185, 129, 1)",
            backgroundColor: "rgba(16, 185, 129, 0.2)",
            borderWidth: 2,
            fill: false,
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || "";
                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(context.parsed.y);
                }
                return label;
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return "$" + value.toLocaleString();
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [incomeStatements]);

  return (
    <div className="w-full h-full">
      <canvas ref={chartRef} />
    </div>
  );
}
