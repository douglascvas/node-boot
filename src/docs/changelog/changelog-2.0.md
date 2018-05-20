# 2.0

- Major rewrite of code.
- Created support for plugins (class processors and class providers).
- Classes are instantiated now using builder pattern.
- Created support for filters.
- Changed signature for ApplicationManager
- All classes are now built with Builder pattern.
- WebManager became an interface, which is implemented by ExpressWebManager
- Changed signature of methods in DependencyManager.
- Changed signature of methods in ApplicationManager.
- Removed @AutoScan in favor of configuring directly when building ApplicationManager.
- Some minor fixes.
- Adjusted documentation accordingly.