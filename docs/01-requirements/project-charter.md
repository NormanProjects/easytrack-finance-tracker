# EasyTrack Project Charter

## Project Overview
**Project Name**: EasyTrack Personal Finance Tracker  
**Project Manager**: Ntokozo Norman Mashia 
**Project Type**: Portfolio Project / Learning Project

## Objectives
1. Build a production-ready personal finance tracker
2. Demonstrate full-stack development skills (Java/Spring Boot + Angular)
3. Showcase enterprise software engineering practices (SDLC, testing, CI/CD)
4. Create a portfolio piece for job applications

## Success Criteria
-  User can register, login, and logout securely
-  User can add, edit, delete transactions
-  User can import transactions via CSV
-  User can set budgets and track spending
-  Dashboard loads in < 1.5 seconds
-  Mobile responsive design
-  70%+ test coverage
-  Deployed and accessible online
-  Complete documentation for GitHub README

## Out of Scope (for MVP)
- Email verification on registration
- Two-factor authentication
- Bill reminders / recurring transactions
- Investment tracking
- Multi-user budgets
- Mobile native apps

## Risks & Mitigation
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Timeline too aggressive | High | Medium | Cut non-essential features |
| OAuth integration issues | Medium | Low | Use local auth first, add OAuth later |
| Frontend complexity | Medium | Medium | Use component library (Tailwind) |
| Database performance | Low | Low | Proper indexing from start |

## Timeline
See: `docs/03-implementation/sprint-plan.md`

## Stakeholders
- **Developer**: Ntokozo
- **End Users**: Personal finance enthusiasts
- **Hiring Managers**: Target audience for portfolio