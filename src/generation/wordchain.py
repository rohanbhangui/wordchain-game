import random
import csv
import urllib.request
from collections import deque

# Download a clean English word list
print("Downloading word list...")
url = "https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt"
response = urllib.request.urlopen(url)
raw_words = response.read().decode().splitlines()

# Filter for valid words (3 to 8 characters)
word_list = set(w.lower() for w in raw_words if w.isalpha() and 3 <= len(w) <= 8)
word_list_by_length = {length: [w for w in word_list if len(w) == length] for length in range(3, 9)}

# Function to find word chains (one letter at a time)
def find_chain(start, end, word_set):
    if start == end or len(start) != len(end):
        return []
    queue = deque([[start]])
    visited = set([start])

    while queue:
        path = queue.popleft()
        last_word = path[-1]

        for i in range(len(last_word)):
            for c in 'abcdefghijklmnopqrstuvwxyz':
                if c != last_word[i]:
                    new_word = last_word[:i] + c + last_word[i+1:]
                    if new_word == end:
                        return path + [new_word]
                    if new_word in word_set and new_word not in visited:
                        visited.add(new_word)
                        queue.append(path + [new_word])
    return []

# Initialize results
results = []
used_pairs = set()
attempts = 0
max_attempts = 10000

# Generate chains
print("Generating chains...")
while attempts < max_attempts:
    length = random.randint(3, 8)
    words = word_list_by_length[length]
    start, end = random.sample(words, 2)
    pair = tuple(sorted((start, end)))
    if pair in used_pairs or start == end:
        attempts += 1
        continue

    chain = find_chain(start, end, set(words))
    if chain:
        used_pairs.add(pair)
        results.append({
            'start word': start,
            'end word': end,
            'solution': ','.join(chain),
            'number of words': len(chain)
        })
    attempts += 1

# Save to CSV
filename = "chainmail_word_chains.csv"
with open(filename, 'w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['start word', 'end word', 'solution', 'number of words'])
    writer.writeheader()
    writer.writerows(results)

print(f"\n✅ Done! Generated {len(results)} chains and saved to {filename}")