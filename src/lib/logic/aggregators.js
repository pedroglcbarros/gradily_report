export function calculateAggregates(rows) {
    if (!rows || rows.length === 0) return {};

    const res = {};

    // --- 1. Distinct Counts (Metadata) ---
    
    // Generic distinct count helper
    const countUnique = (field) => {
        const values = rows.map(r => r[field]).filter(v => v !== null && v !== undefined && v !== '');
        return new Set(values).size;
    };

    res.city_name = { label: 'Cities', value: countUnique('city_name') };
    res.school_name = { label: 'Schools', value: countUnique('school_name') };
    res.class_name = { label: 'Classes', value: countUnique('class_name') };
    res.exam_type = { label: 'Exams', value: countUnique('exam_type') };

    // Student: Handle capitalization mix (Ana vs ana)
    const studentNames = rows
        .map(r => r.student_name ? r.student_name.toLowerCase() : null)
        .filter(Boolean);
    res.student_name = { label: 'Students', value: new Set(studentNames).size };

    // --- 2. Date Range (Months) ---
    const dates = rows.map(r => r.essay_date ? new Date(r.essay_date) : null).filter(Boolean);
    if (dates.length > 0) {
        // Sort to find min and max
        dates.sort((a, b) => a - b);
        const min = dates[0];
        const max = dates[dates.length - 1];

        // Calculate difference in months
        const months = (max.getFullYear() - min.getFullYear()) * 12 + (max.getMonth() - min.getMonth());
        res.essay_date = { label: 'Range', value: `${months} mths` };
    } else {
        res.essay_date = { label: 'Range', value: '-' };
    }

    // --- 3. Grades (Conditional Logic) ---
    
    // Determine context
    // We check if we have ANY numeric rows (ENEM) and ANY non-numeric rows (SAEB)
    const hasEnem = rows.some(r => r._meta?.isNumeric);
    const hasSaeb = rows.some(r => r._meta?.isNumeric === false); // Explicit false check
    
    const isMixed = hasEnem && hasSaeb;
    const isOnlyEnem = hasEnem && !hasSaeb;
    const isOnlySaeb = !hasEnem && hasSaeb;

    ['final', 'c1', 'c2', 'c3', 'c4', 'c5'].forEach(key => {
        const validValues = rows.map(r => r[key]).filter(v => v !== null && v !== undefined && v !== '' && v !== '-');

        if (validValues.length === 0) {
            res[key] = { label: '-', value: '-' };
            return;
        }

        if (isMixed) {
            // Rule: Mixed = Null
            res[key] = { label: 'Mixed', value: '-' };
        } 
        else if (isOnlyEnem) {
            // Rule: ENEM = Average
            const sum = validValues.reduce((a, b) => a + Number(b), 0);
            const avg = (sum / validValues.length).toFixed(0); // Round to whole number for cleanliness
            res[key] = { label: 'Avg', value: avg };
        } 
        else if (isOnlySaeb) {
            // Rule: SAEB = Mode (Most frequent)
            const counts = {};
            let maxCount = 0;
            let mode = '-';

            validValues.forEach(val => {
                const v = String(val);
                counts[v] = (counts[v] || 0) + 1;
                if (counts[v] > maxCount) {
                    maxCount = counts[v];
                    mode = v;
                }
            });
            res[key] = { label: 'Mode', value: mode };
        }
    });

    return res;
}