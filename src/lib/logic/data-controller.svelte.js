import Papa from 'papaparse';
import { normalizeDataset } from './data-processor.js';
import { calculateAggregates } from './aggregators.js';

export class DataController {
    // --- State ---
    rawData = $state([]);
    loading = $state(true);
    error = $state('');

    searchQuery = $state('');
    groupBy = $state('None');
    
    filters = $state({
        city: 'All',
        school: 'All',
        class: 'All',
        exam: 'All', // 'All' | 'enem' | 'saeb' | 'saeb_6' | 'saeb_7' | 'saeb_8' | 'saeb_9'
        startMonth: 'All',
        endMonth: 'All'
    });

    sortState = $state([{ key: 'essay_date', dir: 'desc' }]);

    constructor(csvUrl) {
        if (typeof window !== 'undefined' && csvUrl) {
            this.loadData(csvUrl);
        } else {
            this.loading = false;
        }
    }

    loadData(url) {
        this.loading = true;
        this.error = '';

        Papa.parse(url, {
            download: true,
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: (results) => {
                try {
                    const cleanRaw = results.data.map(row => {
                        const clean = {};
                        if (row) {
                            Object.keys(row).forEach(k => clean[k.trim()] = row[k]);
                        }
                        return clean;
                    });
                    this.rawData = normalizeDataset(cleanRaw);
                } catch (err) {
                    console.error("Data Processing Error:", err);
                    this.error = "Error processing dataset structure.";
                } finally {
                    this.loading = false;
                }
            },
            error: (err) => {
                console.error("CSV Load Error:", err);
                this.error = "Failed to load CSV file. Check file path.";
                this.loading = false;
            }
        });
    }

    // --- Filter Logic ---
    checkRow(row, ignoreKey = null) {
        if (!row) return false;

        // 1. Search
        if (this.searchQuery) {
            const q = this.searchQuery.toLowerCase();
            const searchable = [
                row.student_name || '', 
                row.school_name || '', 
                row.city_name || '', 
                row.class_name || ''
            ].join(' ').toLowerCase();
            if (!searchable.includes(q)) return false;
        }

        // 2. Filters
        if (ignoreKey !== 'city' && this.filters.city !== 'All' && row.city_name !== this.filters.city) return false;
        if (ignoreKey !== 'school' && this.filters.school !== 'All' && row.school_name !== this.filters.school) return false;
        if (ignoreKey !== 'class' && this.filters.class !== 'All' && row.class_name !== this.filters.class) return false;
        
        // Exam Logic (Updated for Specific Years)
        if (ignoreKey !== 'exam' && this.filters.exam !== 'All') {
            const type = row.exam_type?.toLowerCase() || '';
            const cls = row.class_name?.toLowerCase() || '';

            if (this.filters.exam === 'enem') {
                if (type !== 'enem') return false;
            } 
            else if (this.filters.exam === 'saeb') {
                if (!type.includes('saeb')) return false;
            }
            else if (this.filters.exam.startsWith('saeb_')) {
                // Must be SAEB
                if (!type.includes('saeb')) return false;
                
                // Extract year '6', '7', '8', '9'
                const year = this.filters.exam.split('_')[1]; 
                // Check if class name contains that year (e.g., '6º', '6o', '6°')
                const hasYear = cls.includes(`${year}º`) || cls.includes(`${year}o`) || cls.includes(`${year}°`);
                
                if (!hasYear) return false;
            }
        }

        const rowMonth = row.essay_date ? row.essay_date.substring(0, 7) : '';
        if (ignoreKey !== 'dates') {
            if (this.filters.startMonth !== 'All' && rowMonth < this.filters.startMonth) return false;
            if (this.filters.endMonth !== 'All' && rowMonth > this.filters.endMonth) return false;
        }

        return true;
    }

    // --- Derived Views ---
    filteredRows = $derived.by(() => {
        return this.rawData.filter(r => this.checkRow(r));
    });

    sortedRows = $derived.by(() => {
        const data = [...this.filteredRows];
        if (this.sortState.length === 0) return data;

        data.sort((a, b) => {
            for (let sortRule of this.sortState) {
                const { key, dir } = sortRule;
                let valA = a[key] ?? '';
                let valB = b[key] ?? '';
                
                const isNum = typeof valA === 'number' && typeof valB === 'number';
                let comparison = isNum ? valA - valB : String(valA).localeCompare(String(valB));

                if (comparison !== 0) return dir === 'asc' ? comparison : -comparison;
            }
            return 0;
        });
        return data;
    });

    groupedView = $derived.by(() => {
        if (this.groupBy === 'None') return [{ title: 'All Records', rows: this.sortedRows }];
        const groups = {};
        this.sortedRows.forEach(row => {
            const key = row[this.groupBy] || 'Unknown';
            if (!groups[key]) groups[key] = [];
            groups[key].push(row);
        });
        return Object.keys(groups).sort().map(k => ({ title: k, rows: groups[k] }));
    });

    aggregates = $derived(calculateAggregates(this.sortedRows));

    // --- Options Helpers ---
    getOptions(field, ignoreKey) {
        const validRows = this.rawData.filter(r => this.checkRow(r, ignoreKey));
        const set = new Set(validRows.map(r => r[field]).filter(Boolean));
        return ['All', ...Array.from(set).sort()];
    }

    uniqueCities = $derived(this.getOptions('city_name', 'city'));
    uniqueSchools = $derived(this.getOptions('school_name', 'school'));
    uniqueClasses = $derived(this.getOptions('class_name', 'class'));
    
    availableMonths = $derived.by(() => {
        const validRows = this.rawData.filter(r => this.checkRow(r, 'dates'));
        const set = new Set(validRows.map(r => r.essay_date ? r.essay_date.substring(0, 7) : null).filter(Boolean));
        return Array.from(set).sort();
    });

    // --- Actions ---
    toggleSort(key, multi = false) {
        const existingIdx = this.sortState.findIndex(s => s.key === key);
        if (existingIdx > -1) {
            const current = this.sortState[existingIdx];
            if (current.dir === 'asc') this.sortState[existingIdx].dir = 'desc';
            else this.sortState.splice(existingIdx, 1);
        } else {
            const newRule = { key, dir: 'asc' };
            if (multi) this.sortState.push(newRule);
            else this.sortState = [newRule];
        }
    }

    resetFilters() {
        this.filters = { city: 'All', school: 'All', class: 'All', exam: 'All', startMonth: 'All', endMonth: 'All' };
        this.searchQuery = '';
    }
    resetSort() { this.sortState = [{ key: 'essay_date', dir: 'desc' }]; }
    resetGroup() { this.groupBy = 'None'; }
    resetAll() { this.resetFilters(); this.resetSort(); this.resetGroup(); }

    exportCSV() {
        if (this.sortedRows.length === 0) return;
        const csv = Papa.unparse(this.sortedRows);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `evaluations_export_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}