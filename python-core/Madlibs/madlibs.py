# theory string concat
# suppose we want to create a string that say "subscribe to ______"
author = "William Giang Nguyen"  # some string variable
# a few ways to do this
print("subscribe to " + author)
print("subscribe to {}".format(author))
print(f"subscribe to {author}")

adj = input("Adjective: ")
verb1 = input("Verb: ")
verb2 = input("Verb: ")
famous_person = input("Famous person: ")

madlib = f"Computer programming is so {adj}! It makes me so excited all the time because \
I love to {verb1}. Stay hydrated and {verb2} like you are {famous_person}"

print(madlib)
