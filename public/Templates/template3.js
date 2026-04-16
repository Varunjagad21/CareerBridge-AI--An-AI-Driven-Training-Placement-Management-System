// template3.js — populates Template 3 (Modern two-column resume)

function fillTemplate3(data) {
    const t3 = $('#Template_3');

    // ── Name & Tagline ──
    t3.find('.t3-name').text(data.fullName || '');
    t3.find('.t3-tagline').text(data.tagline || '');

    // ── Contact Details ──
    t3.find('.t3-email').text(data.email || '');
    t3.find('.t3-phone').text(data.number || '');
    t3.find('.t3-location').text(data.fullAddress || '');
    t3.find('.t3-linkedin').text(data.linkedIn || '');
    t3.find('.t3-website').text(data.website || '');

    // Hide empty detail rows
    if (!data.linkedIn) t3.find('.t3-linkedin-row').hide();
    if (!data.website)  t3.find('.t3-website-row').hide();

    // ── Profile Photo ──
    if (data.imgSrc) {
        t3.find('.t3-photo').attr('src', data.imgSrc).show();
    } else {
        t3.find('.t3-photo').hide();
    }

    // ── Summary ──
    if (data.profile) {
        t3.find('.t3-summary-text').text(data.profile);
        t3.find('.t3-summary-section').show();
    } else {
        t3.find('.t3-summary-section').hide();
    }

    // ── Skills ──
    const skillsContainer = t3.find('.t3-skills-list');
    skillsContainer.html('');
    data.skills.forEach(s => {
        if (s) skillsContainer.append(`<div class="t3-skill-item">${s}</div>`);
    });
    if (!data.skills.length) t3.find('.t3-skills-section').hide();

    // ── Languages ──
    const langContainer = t3.find('.t3-lang-list');
    langContainer.html('');
    data.languages.forEach(l => {
        if (l.name) langContainer.append(`<div class="t3-lang-item">${l.name}${l.level ? ' — ' + l.level : ''}</div>`);
    });
    if (!data.languages.length) t3.find('.t3-lang-section').hide();

    // ── Interests ──
    const intContainer = t3.find('.t3-interest-list');
    intContainer.html('');
    data.interests.forEach(i => {
        if (i) intContainer.append(`<div class="t3-interest-item">${i}</div>`);
    });
    if (!data.interests.length) t3.find('.t3-interest-section').hide();

    // ── Education ──
    const eduContainer = t3.find('.t3-edu-content');
    eduContainer.html('');
    data.education.forEach(e => {
        if (!e.degree && !e.school) return;
        const dateStr = e.startDate ? `${e.startDate} — ${e.endDate || 'Present'}` : '';
        eduContainer.append(`
            <div class="t3-edu-item">
                ${dateStr ? `<div class="t3-edu-dates">${dateStr}</div>` : ''}
                <div class="t3-edu-degree">${e.degree}</div>
                <div class="t3-edu-school">${e.school}</div>
                ${e.desc ? `<div class="t3-edu-desc">${e.desc}</div>` : ''}
            </div>
        `);
    });
    if (!data.education.length) t3.find('.t3-edu-section').hide();

    // ── Work Experience ──
    const expContainer = t3.find('.t3-exp-content');
    expContainer.html('');
    data.experience.forEach(w => {
        if (!w.title && !w.company) return;
        const dateStr = w.startDate ? `${w.startDate} — ${w.endDate || 'Present'}` : '';
        expContainer.append(`
            <div class="t3-exp-item">
                ${dateStr ? `<div class="t3-exp-dates">${dateStr}</div>` : ''}
                <div class="t3-exp-title">${w.title}</div>
                <div class="t3-exp-company">${w.company}</div>
                ${w.desc ? `<div class="t3-exp-desc">${w.desc}</div>` : ''}
            </div>
        `);
    });
    if (!data.experience.length) t3.find('.t3-exp-section').hide();

    // ── Achievements ──
    const achievContainer = t3.find('.t3-achiev-content');
    achievContainer.html('');
    if (data.achievements) {
        const lines = data.achievements.split('\n').filter(l => l.trim());
        lines.forEach(line => {
            achievContainer.append(`<div class="t3-achiev-item">${line}</div>`);
        });
        if (lines.length) t3.find('.t3-achiev-section').show();
        else t3.find('.t3-achiev-section').hide();
    } else {
        t3.find('.t3-achiev-section').hide();
    }
}