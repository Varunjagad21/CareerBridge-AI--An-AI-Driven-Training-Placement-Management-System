// transfer.js — reads all form data and populates all 3 resume templates

function template_selector() {

    // ── Use querySelector to safely detect checked radio ──
    const selected = document.querySelector('input[name="selected_template"]:checked');
    const t3Selected = selected.id === 'template_3';
    if (!selected) {
        alert('Please select a template first.');
        return;
    }

    const t1Selected = selected.id === 'template_1';
    const t2Selected = selected.id === 'template_2';
    const t3Selected = selected.id === 'template_3';

    // ── Collect personal data ──
    const fname    = $('#fname').val().trim();
    const lname    = $('#lname').val().trim();
    const fullName = (fname + ' ' + lname).trim();
    const email    = $('#email').val().trim();
    const number   = $('#number').val().trim();
    const address  = $('#address').val().trim();
    const country  = $('#country').val().trim();
    const state    = $('#state').val().trim();
    const city     = $('#city').val().trim();
    const gender   = $('#gender').val().trim();
    const dobRaw   = $('#dob').val();
    const linkedIn = $('#linkedIn').val().trim();
    const website  = $('#website').val().trim();
    const imgSrc   = $('#image').attr('src') || '';
    const profile  = $('#profile_desc').length ? $('#profile_desc').val().trim() : '';
    const tagline  = $('#tagline').length ? $('#tagline').val().trim() : '';
    const achievements   = $('#achievements_desc').length ? $('#achievements_desc').val().trim() : '';
    const certifications = $('#certifications_desc').length ? $('#certifications_desc').val().trim() : '';

    let dob = '';
    if (dobRaw) {
        const d = new Date(dobRaw);
        dob = d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    const fullAddress = [address, city, state, country].filter(Boolean).join(', ');

    // Collect education
    const education = [];
    $('#accordionEdu .accordion-item').each(function () {
        education.push({
            degree:    $(this).find('.degree').val().trim(),
            school:    $(this).find('.school').val().trim(),
            startDate: $(this).find('.edu_start').length ? $(this).find('.edu_start').val().trim() : '',
            endDate:   $(this).find('.edu_end').length   ? $(this).find('.edu_end').val().trim()   : '',
            desc:      $(this).find('.edu_desc').length  ? $(this).find('.edu_desc').val().trim()  : ''
        });
    });

    // Collect experience
    const experience = [];
    $('#accordionWork .accordion-item').each(function () {
        experience.push({
            title:     $(this).find('.job_title').val().trim(),
            company:   $(this).find('.company_name').val().trim(),
            startDate: $(this).find('.work_start').length ? $(this).find('.work_start').val().trim() : '',
            endDate:   $(this).find('.work_end').length   ? $(this).find('.work_end').val().trim()   : '',
            desc:      $(this).find('.work_desc').length  ? $(this).find('.work_desc').val().trim()  : ''
        });
    });

    // Collect skills, interests, languages
    const skills = [];
    $('.skill').each(function () { const v=$(this).val().trim(); if(v) skills.push(v); });

    const interests = [];
    $('.hobby').each(function () { const v=$(this).val().trim(); if(v) interests.push(v); });

    const languages = [];
    $('#accordionLang .accordion-item').each(function () {
        const name  = $(this).find('.lang').val().trim();
        const level = $(this).find('.lang_level').length ? $(this).find('.lang_level').val().trim() : '';
        if (name) languages.push({ name, level });
    });

    const data = {
        fullName, fname, lname, email, number, address, country, state, city,
        fullAddress, gender, dob, linkedIn, website, imgSrc, profile, tagline,
        achievements, certifications, education, experience, skills, interests, languages
    };

    // ── Populate T1 + T2 ──
    $('[id="t_name"]').text(fullName);
    $('#Template_1 #t_dob').text(dob);
    $('#Template_2 #t_dob').text(dob);
    $('#Template_1 #t_gender').text(gender);
    $('#Template_2 #t_gender').text(gender);
    $('[id="t_email"]').text(email);
    $('[id="t_number"]').text(number);
    $('[id="t_address"]').text(fullAddress);
    $('[id="t_linkedIn"]').text(linkedIn);
    $('[id="t_website"]').text(website);
    if (imgSrc) {
        $('.t1 .profilepic').attr('src', imgSrc);
        $('.t2 .profilepic').attr('src', imgSrc);
    }
    if (profile) {
        $('.t1 .right_side .prof').html(`<h2 class="title2">Profile</h2><p>${profile}</p>`);
        $('.t2 .lower_right .profile').html(`<div class="hr title">Profile</div><p style="font-size:12px;line-height:1.5">${profile}</p>`);
    }

    // Education T1+T2
    $('.t1 .left_side .education ul').html('');
    $('.t2 .lower_right .education .content').html('');
    education.forEach(e => {
        if (!e.degree && !e.school) return;
        const ds = e.startDate ? `${e.startDate} – ${e.endDate||'Present'}` : '';
        $('.t1 .left_side .education ul').append(`<li><span class="year">${ds}</span><span class="text"><strong>${e.degree}</strong><br>${e.school}</span></li>`);
        $('.t2 .lower_right .education .content').append(`<div style="display:flex;gap:12px;margin-bottom:10px"><div style="min-width:80px;font-size:11px;color:#666">${ds}</div><div><strong style="font-size:12px">${e.degree}</strong><div style="font-size:11px;color:#555">${e.school}</div>${e.desc?`<div style="font-size:11px;color:#777">${e.desc}</div>`:''}</div></div>`);
    });

    // Experience T1+T2
    $('.t1 .right_side .experience').html('<h2 class="title2">Experience</h2>');
    $('.t2 .lower_right .experience .content').html('');
    experience.forEach(w => {
        if (!w.title && !w.company) return;
        const ds = w.startDate ? `${w.startDate} – ${w.endDate||'Present'}` : '';
        $('.t1 .right_side .experience').append(`<div style="margin-bottom:12px"><span style="font-size:11px;color:#888">${ds}</span><h3 style="margin:2px 0;font-size:14px;font-weight:700">${w.title}</h3><span style="font-size:12px;color:#555">${w.company}</span>${w.desc?`<p style="font-size:12px;margin-top:4px">${w.desc}</p>`:''}</div>`);
        $('.t2 .lower_right .experience .content').append(`<div style="display:flex;gap:12px;margin-bottom:12px"><div style="min-width:80px;font-size:11px;color:#666">${ds}</div><div><strong style="font-size:12px">${w.title}</strong><div style="font-size:11px;color:#555">${w.company}</div>${w.desc?`<div style="font-size:11px;color:#777;margin-top:3px">${w.desc}</div>`:''}</div></div>`);
    });

    // Skills T1+T2
    $('.t1 .right_side .skills .box').html('');
    $('.t2 .lower .lower_left .skills .content').html('');
    skills.forEach(s => {
        $('.t1 .right_side .skills .box').append(`<div class="per" style="margin-bottom:6px"><span>${s}</span></div>`);
        $('.t2 .lower .lower_left .skills .content').append(`<span style="display:inline-block;margin:2px 4px;font-size:12px">${s}</span>`);
    });

    // Interests T1+T2
    $('.t1 .right_side .interest ul').html('');
    $('.t2 .lower .lower_left .interests .content').html('');
    interests.forEach(i => {
        $('.t1 .right_side .interest ul').append(`<li>${i}</li>`);
        $('.t2 .lower .lower_left .interests .content').append(`<span style="display:inline-block;margin:2px 4px;font-size:12px">${i}</span>`);
    });

    // Languages T1+T2
    $('.t1 .left_side .language ul').html('');
    $('.t2 .lower .lower_left .languages .content .con').html('');
    languages.forEach(l => {
        $('.t1 .left_side .language ul').append(`<li><span class="text">${l.name}${l.level?' — '+l.level:''}</span></li>`);
        $('.t2 .lower .lower_left .languages .content .con').append(`<div style="font-size:12px;margin-bottom:3px">${l.name}${l.level?` <span style="color:#888;font-size:11px">(${l.level})</span>`:''}</div>`);
    });

    // Achievements T1+T2
    $('.t1 .right_side .achievements').html('<h2 class="title2">Achievements</h2>');
    $('.t2 .lower_right .achievements .content .con').html('');
    if (achievements) {
        achievements.split('\n').filter(l=>l.trim()).forEach(item => {
            $('.t1 .right_side .achievements').append(`<p style="font-size:12px;margin-bottom:4px">• ${item}</p>`);
            $('.t2 .lower_right .achievements .content .con').append(`<div style="font-size:12px;margin-bottom:4px">• ${item}</div>`);
        });
    }

    // ── Populate T3 ──
    if (t3Selected) {
        // Name & tagline
        $('.t3-name').text(fullName);
        $('.t3-tagline').text(tagline);

        // Contact
        $('.t3-email').text(email);
        $('.t3-phone').text(number);
        $('.t3-location').text(fullAddress);
        $('.t3-linkedin').text(linkedIn);
        $('.t3-website').text(website);
        if (!linkedIn) $('.t3-linkedin-row').hide(); else $('.t3-linkedin-row').show();
        if (!website)  $('.t3-website-row').hide();  else $('.t3-website-row').show();

        // Profile image
        if (imgSrc) $('.t3 .profilepic').attr('src', imgSrc);

        // Summary
        if (profile) {
            $('.t3-summary-text').text(profile);
            $('.t3-summary-section').show();
        } else {
            $('.t3-summary-section').hide();
        }

        // Skills
        $('.t3-skills-list').html('');
        skills.forEach(s => {
            $('.t3-skills-list').append(`<div style="font-size:12.5px;color:#333;padding:3px 0 3px 12px;position:relative;line-height:1.5;">
                <span style="position:absolute;left:2px;font-size:16px;color:#555;line-height:1.1;">·</span>${s}
            </div>`);
        });

        // Languages
        $('.t3-lang-list').html('');
        languages.forEach(l => {
            $('.t3-lang-list').append(`<div style="font-size:12.5px;color:#333;padding:2px 0;">${l.name}${l.level ? ' — ' + l.level : ''}</div>`);
        });

        // Interests
        $('.t3-interest-list').html('');
        interests.forEach(i => {
            $('.t3-interest-list').append(`<div style="font-size:12.5px;color:#333;padding:2px 0;">${i}</div>`);
        });

        // Education
        $('.t3-edu-content').html('');
        education.forEach(e => {
            if (!e.degree && !e.school) return;
            const ds = e.startDate ? `${e.startDate} — ${e.endDate||'Present'}` : '';
            $('.t3-edu-content').append(`
                <div style="margin-bottom:16px;">
                    ${ds ? `<div style="font-size:11.5px;color:#777;margin-bottom:2px;">${ds}</div>` : ''}
                    <div style="font-size:13px;font-weight:700;color:#1a1a1a;text-transform:uppercase;letter-spacing:0.3px;">${e.degree}</div>
                    <div style="font-size:12px;color:#444;margin-top:1px;">${e.school}</div>
                    ${e.desc ? `<div style="font-size:12px;color:#666;margin-top:3px;">${e.desc}</div>` : ''}
                </div>
            `);
        });

        // Experience
        $('.t3-exp-content').html('');
        experience.forEach(w => {
            if (!w.title && !w.company) return;
            const ds = w.startDate ? `${w.startDate} — ${w.endDate||'Present'}` : '';
            $('.t3-exp-content').append(`
                <div style="margin-bottom:16px;">
                    ${ds ? `<div style="font-size:11.5px;color:#777;">${ds}</div>` : ''}
                    <div style="font-size:13px;font-weight:700;color:#1a1a1a;text-transform:uppercase;">${w.title}</div>
                    <div style="font-size:12px;color:#555;">${w.company}</div>
                    ${w.desc ? `<div style="font-size:12px;color:#666;margin-top:3px;line-height:1.5;">${w.desc}</div>` : ''}
                </div>
            `);
        });

        // Achievements
        $('.t3-achiev-content').html('');
        if (achievements) {
            achievements.split('\n').filter(l=>l.trim()).forEach(item => {
                $('.t3-achiev-content').append(`<div style="font-size:12.5px;color:#444;line-height:1.6;margin-bottom:4px;">${item}</div>`);
            });
            $('.t3-achiev-section').show();
        } else {
            $('.t3-achiev-section').hide();
        }

        // Certifications
        $('.t3-cert-content').html('');
        if (certifications) {
            certifications.split('\n').filter(l=>l.trim()).forEach(item => {
                $('.t3-cert-content').append(`<div style="font-size:12.5px;color:#444;line-height:1.6;margin-bottom:4px;">${item}</div>`);
            });
            $('.t3-cert-section').show();
        } else {
            $('.t3-cert-section').hide();
        }
    }

    // ── Show selected template, hide nav and forms ──
    document.getElementById('nav').style.display = 'none';
    document.querySelectorAll('form.step').forEach(f => f.classList.remove('active'));
    $('#Template_1, #Template_2, #Template_3').css('display', 'none');

    if (t1Selected)      $('#Template_1').css('display', 'block');
    else if (t2Selected) $('#Template_2').css('display', 'block');
    else if (t3Selected) $('#Template_3').css('display', 'block');
}

// ── Download as PDF ──
$(document).on('click', '.printCv', function () { window.print(); });

// ── Download as Image ──
$(document).on('click', '.dwnldimage', function () {
    const targetId = $('#Template_3').is(':visible') ? 't3-target' : 'target';
    const target = document.getElementById(targetId);
    html2canvas(target, { scale: 2, useCORS: true }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'resume.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
});