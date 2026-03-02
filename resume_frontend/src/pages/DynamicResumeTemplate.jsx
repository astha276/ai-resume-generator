import React, { useRef } from 'react';

const safeString = (value, defaultValue = '') => {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  return defaultValue;
};

const safeArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [];
};

const Section = ({ title, icon, children }) => (
  <section style={{ marginBottom: '2rem' }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '1rem',
      borderBottom: '2px solid #E2E8F0',
      paddingBottom: '0.5rem'
    }}>
      <span style={{ fontSize: '1rem' }}>{icon}</span>
      <h2 style={{
        fontSize: '0.7rem',
        fontWeight: '800',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#1A202C',
        margin: 0,
        fontFamily: "'DM Sans', sans-serif"
      }}>{title}</h2>
    </div>
    {children}
  </section>
);

const Tag = ({ children, color = '#2563EB' }) => (
  <span style={{
    fontSize: '0.65rem',
    fontWeight: '700',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    padding: '0.2rem 0.6rem',
    borderRadius: '3px',
    background: `${color}12`,
    color: color,
    border: `1px solid ${color}30`,
    fontFamily: "'DM Sans', sans-serif"
  }}>{children}</span>
);

const DynamicResumeTemplate = ({ jsonData }) => {
  const resumeRef = useRef(null);

  if (!jsonData) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>No resume data available.</div>;
  }

  const data = jsonData.data || jsonData;
  const personalInfo = data.personalInformation || {};
  const skills = safeArray(data.skills);
  const projects = safeArray(data.projects);
  const experience = safeArray(data.experience);
  const education = safeArray(data.education);
  const certifications = safeArray(data.certifications);
  const achievements = safeArray(data.achievements);
  const interests = safeArray(data.interests);

  // Derive job title from first experience entry
  const jobTitle = experience[0]?.jobTitle?.includes(' at ')
    ? experience[0].jobTitle.split(' at ')[0]
    : experience[0]?.jobTitle || '';

  const styles = {
    page: {
      background: '#F7F8FC',
      minHeight: '100vh',
      padding: '2rem 1rem',
      fontFamily: "'DM Sans', sans-serif",
    },
    actionBar: {
      position: 'sticky',
      top: 0,
      zIndex: 10,
      background: 'white',
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      padding: '0.75rem 1rem',
      display: 'flex',
      justifyContent: 'center',
      gap: '0.75rem',
      marginBottom: '1.5rem',
    },
    btnPdf: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
      background: '#1A202C',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1.2rem',
      borderRadius: '6px',
      fontWeight: '700',
      fontSize: '0.8rem',
      cursor: 'pointer',
      letterSpacing: '0.04em',
    },
    btnPrint: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
      background: 'white',
      color: '#1A202C',
      border: '2px solid #1A202C',
      padding: '0.5rem 1.2rem',
      borderRadius: '6px',
      fontWeight: '700',
      fontSize: '0.8rem',
      cursor: 'pointer',
      letterSpacing: '0.04em',
    },
    paper: {
      background: 'white',
      boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
      maxWidth: '860px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      minHeight: '1100px',
    },
    sidebar: {
      background: '#1A202C',
      color: 'white',
      padding: '2.5rem 1.5rem',
    },
    main: {
      padding: '2.5rem 2rem',
    },
  };

  return (
    <div style={styles.page}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&family=Playfair+Display:wght@700;800&display=swap');
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; }
        }
      `}</style>

      {/* Action Bar */}
      <div className="no-print" style={styles.actionBar}>
        <button style={styles.btnPdf} onClick={() => window.print()}>
          ⬇ Save as PDF
        </button>
        <button style={styles.btnPrint} onClick={() => window.print()}>
          🖨 Print
        </button>
      </div>

      {/* Resume Paper - Two Column */}
      <div ref={resumeRef} style={styles.paper}>

        {/* ── SIDEBAR ── */}
        <aside style={styles.sidebar}>

          {/* Avatar Initials */}
          <div style={{
            width: '72px', height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4F8EF7 0%, #A78BFA 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', fontWeight: '800', color: 'white',
            marginBottom: '1.2rem',
            letterSpacing: '-0.02em'
          }}>
            {(personalInfo.fullName || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </div>

          {/* Name */}
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.45rem',
            fontWeight: '800',
            color: 'white',
            lineHeight: 1.15,
            margin: '0 0 0.3rem 0',
          }}>
            {safeString(personalInfo.fullName, 'Your Name')}
          </h1>

          {/* Title */}
          {jobTitle && (
            <p style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#7DD3FC',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '1.5rem',
            }}>{jobTitle}</p>
          )}

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '1.5rem' }} />

          {/* Contact */}
          <div style={{ marginBottom: '1.8rem' }}>
            <p style={{ fontSize: '0.6rem', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: '0.8rem' }}>Contact</p>
            {[
              { icon: '✉', val: personalInfo.email, href: `mailto:${personalInfo.email}` },
              { icon: '☎', val: personalInfo.phoneNumber },
              { icon: '📍', val: personalInfo.location },
              { icon: '💼', val: personalInfo.linkedin ? personalInfo.linkedin.replace('https://', '').replace('http://', '') : null, href: personalInfo.linkedin },
              { icon: '⌥', val: personalInfo.githubHub, href: `https://${personalInfo.githubHub}` },
              { icon: '🌐', val: personalInfo.portfolio },
            ].filter(c => c.val).map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', marginTop: '1px', opacity: 0.7 }}>{c.icon}</span>
                {c.href
                  ? <a href={c.href} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: '#E2E8F0', wordBreak: 'break-all', textDecoration: 'none', lineHeight: 1.4 }}>{c.val}</a>
                  : <span style={{ fontSize: '0.72rem', color: '#E2E8F0', wordBreak: 'break-all', lineHeight: 1.4 }}>{c.val}</span>
                }
              </div>
            ))}
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div style={{ marginBottom: '1.8rem' }}>
              <p style={{ fontSize: '0.6rem', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: '0.8rem' }}>Skills</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {skills.map((skill, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'white' }}>{skill.title}</span>
                    </div>
                    <div style={{ fontSize: '0.6rem', color: '#94A3B8', letterSpacing: '0.03em' }}>{skill.level}</div>
                    <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '0.25rem' }}>
                      <div style={{
                        height: '100%',
                        borderRadius: '2px',
                        background: 'linear-gradient(90deg, #4F8EF7, #A78BFA)',
                        width: skill.level?.toLowerCase().includes('senior') ? '90%'
                          : skill.level?.toLowerCase().includes('intermediate') ? '65%'
                          : '50%'
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education in sidebar */}
          {education.length > 0 && (
            <div style={{ marginBottom: '1.8rem' }}>
              <p style={{ fontSize: '0.6rem', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: '0.8rem' }}>Education</p>
              {education.map((edu, i) => (
                <div key={i} style={{ marginBottom: '0.8rem' }}>
                  <p style={{ fontSize: '0.75rem', fontWeight: '700', color: 'white', margin: '0 0 0.15rem 0' }}>{edu.degree}</p>
                  <p style={{ fontSize: '0.7rem', color: '#7DD3FC', margin: '0 0 0.1rem 0' }}>{edu.university}</p>
                  <p style={{ fontSize: '0.65rem', color: '#64748B', margin: 0 }}>{edu.location} · {edu.graduationYear}</p>
                </div>
              ))}
            </div>
          )}

          {/* Interests */}
          {interests.length > 0 && (
            <div>
              <p style={{ fontSize: '0.6rem', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#94A3B8', marginBottom: '0.8rem' }}>Interests</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {interests.map((item, i) => (
                  <span key={i} style={{
                    fontSize: '0.65rem', fontWeight: '600',
                    background: 'rgba(255,255,255,0.08)',
                    color: '#CBD5E1', padding: '0.2rem 0.55rem',
                    borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {item.name || item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main style={styles.main}>

          {/* Summary */}
          {personalInfo.summary && (
            <Section title="Professional Summary" icon="◈">
              <p style={{
                fontSize: '0.85rem', color: '#475569', lineHeight: 1.75,
                borderLeft: '3px solid #4F8EF7', paddingLeft: '0.9rem',
                margin: 0, fontStyle: 'italic'
              }}>
                {personalInfo.summary}
              </p>
            </Section>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <Section title="Work Experience" icon="◈">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
                {experience.map((exp, i) => {
                  const title = exp.jobTitle?.includes(' at ') ? exp.jobTitle.split(' at ')[0] : exp.jobTitle;
                  return (
                    <div key={i} style={{ position: 'relative', paddingLeft: '1rem', borderLeft: '3px solid #E2E8F0' }}>
                      <div style={{ position: 'absolute', left: '-5px', top: '4px', width: '7px', height: '7px', borderRadius: '50%', background: '#4F8EF7' }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.3rem' }}>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '800', color: '#1A202C' }}>{title}</h3>
                        <span style={{
                          fontSize: '0.65rem', fontWeight: '700', color: '#4F8EF7',
                          background: '#EFF6FF', padding: '0.15rem 0.55rem', borderRadius: '20px',
                          border: '1px solid #DBEAFE', letterSpacing: '0.04em'
                        }}>{exp.duration}</span>
                      </div>
                      <p style={{ margin: '0.2rem 0 0.5rem 0', fontSize: '0.78rem', fontWeight: '700', color: '#4F8EF7' }}>
                        {exp.company}{exp.location ? ` · ${exp.location}` : ''}
                      </p>
                      {exp.responsibility && (
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: 1.65 }}>
                          {exp.responsibility}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <Section title="Key Projects" icon="◈">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {projects.map((proj, i) => (
                  <div key={i} style={{
                    background: '#F8FAFC', border: '1px solid #E2E8F0',
                    borderRadius: '8px', padding: '1rem',
                    borderLeft: '4px solid #4F8EF7'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <h3 style={{ margin: 0, fontSize: '0.88rem', fontWeight: '800', color: '#1A202C' }}>{proj.title}</h3>
                      {proj.githubLink && (
                        <a href={proj.githubLink} target="_blank" rel="noreferrer" style={{ fontSize: '0.65rem', color: '#4F8EF7', fontWeight: '700', textDecoration: 'none' }}>
                          ⌥ GitHub ↗
                        </a>
                      )}
                    </div>
                    {proj.description && (
                      <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.78rem', color: '#475569', lineHeight: 1.6 }}>{proj.description}</p>
                    )}
                    {safeArray(proj.technologiesUsed).length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {safeArray(proj.technologiesUsed).map((tech, j) => (
                          <Tag key={j} color="#2563EB">{tech}</Tag>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <Section title="Certifications" icon="◈">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                {certifications.map((cert, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                    background: '#FFFBEB', border: '1px solid #FDE68A',
                    padding: '0.6rem 0.8rem', borderRadius: '6px'
                  }}>
                    <span style={{ fontSize: '0.9rem', marginTop: '1px' }}>🏅</span>
                    <div>
                      <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700', color: '#1A202C', lineHeight: 1.3 }}>{cert.title}</p>
                      {cert.issuingOrganization && (
                        <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.65rem', color: '#92400E' }}>{cert.issuingOrganization}</p>
                      )}
                      <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.65rem', color: '#92400E', fontWeight: '600' }}>{cert.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Achievements */}
          {achievements.length > 0 && (
            <Section title="Achievements" icon="◈">
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {achievements.map((ach, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#334155' }}>
                    <span style={{ color: '#F59E0B', fontSize: '0.9rem' }}>★</span>
                    {ach.title}{ach.year ? ` (${ach.year})` : ''}
                  </li>
                ))}
              </ul>
            </Section>
          )}

        </main>
      </div>
    </div>
  );
};

export default DynamicResumeTemplate;