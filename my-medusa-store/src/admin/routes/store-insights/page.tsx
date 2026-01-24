/**
 * Store Insights Dashboard (Professional Tabs Layout)
 * 
 * A clean, tabbed dashboard with global date filtering and premium aesthetics.
 */

import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Tabs, Button } from "@medusajs/ui";
import {
    ChartBar,
    CurrencyDollar,
    Bolt,
    SquaresPlus,
    Calendar,
    UserGroup
} from "@medusajs/icons";
import { useState } from "react";
import FinancialBreakdown from "../../components/FinancialBreakdown";
import PerformanceIndicators from "../../components/PerformanceIndicators";
import AnalyticsDashboard from "../../components/AnalyticsDashboard";
import StoreOverview from "../../components/StoreOverview";
import PakistanMetrics from "../../components/PakistanMetrics";
import TopPerformers from "../../components/TopProducts";
import { MapPin } from "@medusajs/icons";

const StoreInsightsPage = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [dateRange, setDateRange] = useState("last30days");
    const [exporting, setExporting] = useState(false);

    const handleExport = async (format: "csv" | "pdf") => {
        try {
            setExporting(true)
            // Use the sales report export endpoint since it covers most data
            const response = await fetch(
                `/admin/custom/reports/export?type=sales&period=${dateRange}&format=${format}`,
                { method: "POST" }
            )
            if (!response.ok) throw new Error("Export failed")

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `store-insight-${dateRange}.${format}`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error("Export error:", error)
            alert("Failed to export report")
        } finally {
            setExporting(false)
        }
    }

    return (
        <Container className="p-0 overflow-hidden h-full flex flex-col bg-ui-bg-subtle divide-y divide-ui-border-base">
            {/* Header Section */}
            <div className="px-8 py-6 bg-ui-bg-base flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Heading level="h1" className="text-2xl font-bold text-ui-fg-base flex items-center gap-2">
                        Store Insights
                    </Heading>
                    <p className="text-ui-fg-subtle text-sm mt-1">
                        Monitoring & Analytics Dashboard
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-ui-bg-field px-3 py-1.5 rounded-md border border-ui-border-base shadow-sm hover:border-ui-border-strong transition-colors">
                        <Calendar className="text-ui-fg-muted" />
                        <select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            className="bg-transparent text-sm font-medium text-ui-fg-base focus:outline-none border-none cursor-pointer pr-2"
                        >
                            <option value="today">Today</option>
                            <option value="yesterday">Yesterday</option>
                            <option value="last7days">Last 7 Days</option>
                            <option value="last30days">Last 30 Days</option>
                            <option value="thismonth">This Month</option>
                            <option value="thisyear">This Year</option>
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            size="small"
                            onClick={() => handleExport("csv")}
                            disabled={exporting}
                        >
                            Export CSV
                        </Button>
                        <Button
                            variant="secondary"
                            size="small"
                            onClick={() => handleExport("pdf")}
                            disabled={exporting}
                        >
                            Export PDF
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <div className="px-8 bg-ui-bg-base border-b border-ui-border-base">
                        <Tabs.List className="gap-6">
                            <Tabs.Trigger value="overview" className="data-[state=active]:text-ui-fg-base data-[state=active]:border-b-2 data-[state=active]:border-ui-fg-base py-4 rounded-none transition-all">
                                <SquaresPlus className="mr-2" /> Overview
                            </Tabs.Trigger>
                            <Tabs.Trigger value="financials" className="data-[state=active]:text-ui-fg-base data-[state=active]:border-b-2 data-[state=active]:border-ui-fg-base py-4 rounded-none transition-all">
                                <CurrencyDollar className="mr-2" /> Financials
                            </Tabs.Trigger>
                            <Tabs.Trigger value="analytics" className="data-[state=active]:text-ui-fg-base data-[state=active]:border-b-2 data-[state=active]:border-ui-fg-base py-4 rounded-none transition-all">
                                <ChartBar className="mr-2" /> Analytics
                            </Tabs.Trigger>
                            <Tabs.Trigger value="performance" className="data-[state=active]:text-ui-fg-base data-[state=active]:border-b-2 data-[state=active]:border-ui-fg-base py-4 rounded-none transition-all">
                                <Bolt className="mr-2" /> Performance
                            </Tabs.Trigger>
                            <Tabs.Trigger value="pakistan" className="data-[state=active]:text-ui-fg-base data-[state=active]:border-b-2 data-[state=active]:border-ui-fg-base py-4 rounded-none transition-all">
                                <MapPin className="mr-2" /> Pakistan
                            </Tabs.Trigger>
                            <Tabs.Trigger value="top-products" className="data-[state=active]:text-ui-fg-base data-[state=active]:border-b-2 data-[state=active]:border-ui-fg-base py-4 rounded-none transition-all">
                                <UserGroup className="mr-2" /> Top Performers
                            </Tabs.Trigger>
                        </Tabs.List>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 bg-ui-bg-subtle">
                        <div className="max-w-7xl mx-auto">
                            <Tabs.Content value="overview" className="focus-visible:outline-none mt-0">
                                <StoreOverview dateRange={dateRange} />
                            </Tabs.Content>

                            <Tabs.Content value="financials" className="focus-visible:outline-none mt-0">
                                <FinancialBreakdown dateRange={dateRange} />
                            </Tabs.Content>

                            <Tabs.Content value="analytics" className="focus-visible:outline-none mt-0">
                                <AnalyticsDashboard dateRange={dateRange} />
                            </Tabs.Content>

                            <Tabs.Content value="performance" className="focus-visible:outline-none mt-0">
                                <PerformanceIndicators />
                            </Tabs.Content>

                            <Tabs.Content value="pakistan" className="focus-visible:outline-none mt-0">
                                <PakistanMetrics />
                            </Tabs.Content>

                            <Tabs.Content value="top-products" className="focus-visible:outline-none mt-0">
                                <TopPerformers />
                            </Tabs.Content>
                        </div>
                    </div>
                </Tabs>
            </div>
        </Container>
    );
};

export const config = defineRouteConfig({
    label: "Dashboard",
    icon: ChartBar,
});

export default StoreInsightsPage;
