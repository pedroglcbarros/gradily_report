/**
 * data-processor.js
 * Handles the normalization of raw CSV data into a unified schema for the UI.
 */

export function normalizeDataset(rawData) {
	return rawData.map((row, index) => {
		// FIX: Create a truly unique ID for this specific row/evaluation.
		// We append the index to the student_id to allow multiple exams per student.
		const id = row.student_id 
			? `${row.student_id}_${index}` 
			: `row_${index}`;
		
		// 1. Identify Context
		const examType = row.exam_type?.toLowerCase().trim() || 'unknown';
		const className = row.class_name?.toLowerCase() || '';
		
		const is6thYear = className.includes('6º') || className.includes('6o') || className.includes('6°');
		const isSaeb = examType.includes('saeb');

		// 2. Prepare the Normalized Object
		const normalized = {
			id, // Use the fixed unique ID
			city_name: row.city_name,
			school_name: row.school_name,
			class_name: row.class_name,
			student_name: row.student_name,
			exam_type: row.exam_type,
			essay_date: row.essay_date,
			
			final: null,
			c1: null,
			c2: null,
			c3: null,
			c4: null,
			c5: null,

			_meta: {
				isNumeric: !isSaeb,
				verifyingLetter: null,
				isAnnulled: false
			}
		};

		// 3. Apply Mapping Logic
		if (!isSaeb) {
			// --- ENEM LOGIC ---
			normalized.final = row.final_score;
			normalized.c1 = row.competence_1_score;
			normalized.c2 = row.competence_2_score;
			normalized.c3 = row.competence_3_score;
			normalized.c4 = row.competence_4_score;
			normalized.c5 = row.competence_5_score;
		} else {
			// --- SAEB LOGIC ---
			normalized.final = row.final_level || row.final_score;

			let verifyingSourceVal = null;

			if (is6thYear) {
				normalized.c1 = row.competence_1_level;
				normalized.c2 = row.competence_2_level;
				normalized.c3 = row.competence_3_level;
				normalized.c4 = row.competence_4_level;
				verifyingSourceVal = row.competence_5_level;
				
				if (verifyingSourceVal !== normalized.final) {
					normalized.c5 = verifyingSourceVal;
				}
			} else {
				normalized.c1 = row.competence_1_level;
				normalized.c2 = row.competence_2_level;
				normalized.c3 = row.competence_3_level;
				verifyingSourceVal = row.competence_4_level;

				if (verifyingSourceVal !== normalized.final) {
					normalized.c4 = verifyingSourceVal;
				}
				normalized.c5 = null;
			}

			normalized._meta.verifyingLetter = verifyingSourceVal || normalized.final;
			
			if (normalized._meta.verifyingLetter && normalized._meta.verifyingLetter !== 'A') {
				normalized._meta.isAnnulled = true;
			}
		}

		return normalized;
	});
}