1. BUG-01: No module named 'polls.apps.PollsConfigdjango'
- Fix: That means that you are missing a comma after 'polls.apps.PollsConfig in your INSTALLED_APPS setting. It should be:
INSTALLED_APPS = (
    ...
    'polls.apps.PollsConfig',
    'django....',
    ...
)
- Ref: https://stackoverflow.com/questions/35484263/no-module-named-polls-apps-pollsconfigdjango-django-project-tutorial-2
2. 