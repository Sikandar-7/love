// UI/UX Enhancement Utilities for Admin Panel
// Export functions for charts, tooltips, and data export

/**
 * Export chart or data as PNG
 */
export const exportAsPNG = (elementId: string, filename: string = 'chart') => {
    const element = document.getElementById(elementId)
    if (!element) {
        console.error('Element not found')
        return
    }

    // Using html2canvas would be ideal, but for now we'll use a simple approach
    // In production, install: npm install html2canvas
    alert('PNG Export: Install html2canvas library for full functionality')
    console.log(`Exporting ${filename}.png`)
}

/**
 * Export data as CSV
 */
export const exportAsCSV = (data: any[], filename: string = 'data') => {
    if (!data || data.length === 0) {
        alert('No data to export')
        return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const value = row[header]
            // Escape commas and quotes
            return typeof value === 'string' && (value.includes(',') || value.includes('"'))
                ? `"${value.replace(/"/g, '""')}"`
                : value
        }).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

/**
 * Export data as JSON
 */
export const exportAsJSON = (data: any, filename: string = 'data') => {
    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.json`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

/**
 * Print current page
 */
export const printPage = () => {
    window.print()
}

/**
 * Format currency for Pakistan
 */
export const formatPKR = (amount: number): string => {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
    }).format(amount)
}

/**
 * Format date for Pakistan timezone
 */
export const formatPakistanDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleString('en-PK', {
        timeZone: 'Asia/Karachi',
        dateStyle: 'medium',
        timeStyle: 'short'
    })
}

/**
 * Show toast notification
 */
export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) => {
    const toast = document.createElement('div')
    toast.className = `toast ${type}`
    toast.textContent = message
    document.body.appendChild(toast)

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out'
        setTimeout(() => {
            document.body.removeChild(toast)
        }, 300)
    }, duration)
}

/**
 * Copy text to clipboard
 */
export const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Copied to clipboard!', 'success', 2000)
    }).catch(() => {
        showToast('Failed to copy', 'error', 2000)
    })
}

/**
 * Debounce function for search/filter
 */
export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    wait: number
): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout | null = null

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => func(...args), wait)
    }
}

/**
 * Get time ago string
 */
export const getTimeAgo = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date
    const now = new Date()
    const seconds = Math.floor((now.getTime() - d.getTime()) / 1000)

    const intervals: { [key: string]: number } = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
    }

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit)
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`
        }
    }

    return 'just now'
}

/**
 * Generate random color for charts
 */
export const generateChartColor = (index: number): string => {
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#4facfe',
        '#43e97b', '#fa709a', '#fee140', '#30cfd0',
        '#a8edea', '#fed6e3', '#c471f5', '#12c2e9'
    ]
    return colors[index % colors.length]
}

/**
 * Calculate percentage
 */
export const calculatePercentage = (value: number, total: number): number => {
    if (total === 0) return 0
    return Math.round((value / total) * 100)
}

/**
 * Format large numbers (K, M, B)
 */
export const formatLargeNumber = (num: number): string => {
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(1) + 'B'
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
}
