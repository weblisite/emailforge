# 📚 EmailForge Documentation Guide

> **How to use PRD.md and BUILD.md together for effective project management**

---

## 🎯 **Documentation Overview**

EmailForge uses a **dual-documentation system** that provides both **requirements** and **implementation tracking**:

1. **[PRD.md](./PRD.md)** - Product Requirements Document (What to build)
2. **[BUILD.md](./BUILD.md)** - Build Progress Tracker (What has been built)

---

## 🔗 **How to Use Both Documents Together**

### **📋 PRD.md - Your Requirements Blueprint**

The PRD.md contains:
- ✅ **Feature specifications** and requirements
- ✅ **User stories** and acceptance criteria
- ✅ **Technical requirements** and constraints
- ✅ **Success metrics** and KPIs
- ✅ **Project scope** and deliverables

**Use PRD.md when:**
- Planning new features
- Understanding requirements
- Writing user stories
- Defining acceptance criteria
- Project planning and estimation

### **🚀 BUILD.md - Your Implementation Tracker**

The BUILD.md contains:
- ✅ **Implementation status** for each feature
- ✅ **Progress tracking** and completion percentages
- ✅ **Technical implementation** details
- ✅ **Bug fixes** and critical issues resolved
- ✅ **Performance metrics** and optimization status

**Use BUILD.md when:**
- Checking development progress
- Understanding what's been built
- Planning development sprints
- Reporting to stakeholders
- Identifying remaining work

---

## 🔄 **Cross-Referencing System**

### **Feature ID Mapping**

Both documents use consistent feature naming for easy cross-referencing:

| PRD.md Feature | BUILD.md Status | Cross-Reference |
|----------------|-----------------|-----------------|
| **3.1 Lead Management** | ✅ COMPLETE | `PRD: 3.1` → `BUILD: Lead Management System` |
| **4.2 Email Sequences** | ✅ COMPLETE | `PRD: 4.2` → `BUILD: Email Sequence System` |
| **5.1 Campaign Management** | ✅ COMPLETE | `PRD: 5.1` → `BUILD: Campaign Management System` |

### **Example Cross-Reference Workflow**

1. **Start with PRD.md**: "I need to implement Feature 3.1 - Lead Management"
2. **Check BUILD.md**: "Lead Management System is ✅ COMPLETE"
3. **Verify in BUILD.md**: Check implementation details and recent fixes
4. **Update PRD.md**: Mark Feature 3.1 as implemented

---

## 📊 **Progress Tracking Workflow**

### **Daily Development Workflow**

```bash
# 1. Check current status
node scripts/update-build-docs.js --summary

# 2. Update BUILD.md after changes
node scripts/update-build-docs.js --auto --commit

# 3. Review changes
git diff BUILD.md
```

### **Weekly Progress Review**

1. **Run build status summary**
   ```bash
   node scripts/update-build-docs.js --summary
   ```

2. **Review BUILD.md updates**
   - Check completion percentages
   - Review recent fixes
   - Identify blockers

3. **Update PRD.md status**
   - Mark completed features
   - Update progress indicators
   - Add implementation notes

---

## 🛠️ **Automation Tools**

### **Auto-Update Script**

The `scripts/update-build-docs.js` script automatically:
- 📊 Analyzes code implementation status
- 🔄 Updates BUILD.md with current progress
- 📝 Tracks recent git commits
- 📈 Calculates completion percentages

### **GitHub Actions Workflow**

The `.github/workflows/update-build-docs.yml` automatically:
- 🚀 Runs on every code change
- 📝 Updates BUILD.md
- 🔄 Commits documentation changes
- 📊 Provides build status reports

---

## 📋 **Documentation Maintenance**

### **Keeping Documents in Sync**

1. **After implementing a feature:**
   - Update BUILD.md with implementation details
   - Mark feature as complete in BUILD.md
   - Update PRD.md status if needed

2. **After fixing bugs:**
   - Document fixes in BUILD.md
   - Update critical issues section
   - Add to change log

3. **After code reviews:**
   - Update implementation status
   - Add performance metrics
   - Update testing status

### **Regular Updates**

- **Daily**: Run build status summary
- **Weekly**: Update BUILD.md with progress
- **Monthly**: Review and update PRD.md status
- **Per Release**: Major documentation updates

---

## 🎯 **Best Practices**

### **For Developers**

1. **Always check BUILD.md** before starting new features
2. **Update BUILD.md** after completing work
3. **Use consistent naming** between PRD.md and BUILD.md
4. **Document critical fixes** in BUILD.md
5. **Run auto-update script** regularly

### **For Project Managers**

1. **Use PRD.md** for planning and requirements
2. **Use BUILD.md** for progress tracking
3. **Cross-reference** both documents regularly
4. **Update stakeholders** using BUILD.md status
5. **Plan sprints** based on BUILD.md progress

### **For Stakeholders**

1. **Check BUILD.md** for current status
2. **Review PRD.md** for requirements understanding
3. **Use progress percentages** for reporting
4. **Check recent updates** in change log
5. **Review critical issues** and resolutions

---

## 🔍 **Troubleshooting**

### **Common Issues**

1. **BUILD.md not updating:**
   ```bash
   # Check script permissions
   chmod +x scripts/update-build-docs.js
   
   # Run manually
   node scripts/update-build-docs.js --auto
   ```

2. **Progress percentages incorrect:**
   - Check file paths in script
   - Verify component structure
   - Run with --summary flag to debug

3. **GitHub Actions failing:**
   - Check workflow file syntax
   - Verify Node.js version
   - Check file permissions

### **Getting Help**

- 📖 Check this documentation
- 🔍 Review BUILD.md troubleshooting section
- 🐛 Check GitHub Issues
- 💬 Contact development team

---

## 📈 **Metrics and KPIs**

### **Build Progress Metrics**

- **Overall Completion**: Tracked in BUILD.md
- **Feature Completion**: Individual feature status
- **Bug Resolution**: Critical issues resolved
- **Performance**: Optimization status
- **Testing**: QA completion status

### **Reporting Templates**

Use BUILD.md data for:
- 📊 **Sprint Reports**: Feature completion status
- 📈 **Progress Reports**: Overall completion percentage
- 🐛 **Bug Reports**: Critical issues and resolutions
- 🚀 **Release Notes**: Implementation status and features

---

## 🎉 **Success Stories**

### **What This System Achieves**

1. **Clear Progress Tracking**: Always know what's built vs. what's planned
2. **Automated Updates**: Documentation stays current automatically
3. **Cross-Reference**: Easy to find requirements and implementation status
4. **Stakeholder Communication**: Clear progress reporting
5. **Development Planning**: Better sprint planning and estimation

---

## 📞 **Support & Questions**

For questions about this documentation system:

1. **Check this guide** for common questions
2. **Review BUILD.md** for current status
3. **Check PRD.md** for requirements
4. **Run build script** for status updates
5. **Contact team** for specific issues

---

**🎯 Remember: PRD.md tells you WHAT to build, BUILD.md shows you WHAT has been built!**

---

*Last updated: August 31, 2025*  
*Documentation version: 1.0.0*
