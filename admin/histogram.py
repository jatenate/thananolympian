#!/usr/bin/env python

import sqlite3
import sys
import json

def get_histogram(db_name):
    conn = sqlite3.connect(db_name)
    c = conn.cursor()

    ATTRIBUTES = ['height', 'weight', 'age']
    SPORTS = [" and sport like 'Swimming%';", " and sport like 'Gymnastics%';",\
        " and sport like 'Athletics%';", " and sport not like 'Athletics%' and " +\
        "sport not like 'Gymnastics%' and sport not like 'Swimming%';", ';']
    SEXES = ['M', 'F']

    SPORT_COUNT_QUERY = "SELECT COUNT(*) FROM athletes where sex=? and %s=?"
    ALL_COUNT_QUERY  = "SELECT COUNT(*) FROM athletes where sex=?;"
    MIN_MAX_QUERY = "SELECT MIN(%s),MAX(%s) FROM athletes where %s != ''";

    ZERO_ARRAY = [0,0,0,0,0,0,0,0,0,0]

    CM_TO_INCHES = 0.3937
    KG_TO_LB = 2.205

    limit_dict = {}

    # Find the MIN & MAX for each attribute
    for attr in ATTRIBUTES:
        with conn:
            c.execute(MIN_MAX_QUERY % (attr, attr, attr))
            limit_dict[attr] = c.fetchall()

    all_dict = { 'age': {},
            'height': {},
            'weight': {}
        }

    # Get the counts for each attribute and sex
    for attr in ATTRIBUTES:
        min_val = limit_dict[attr][0][0]
        max_val = limit_dict[attr][0][1]

        for sex in SEXES:
            for i in range(min_val-2,max_val+2):
                if i in all_dict[attr]:
                    row = all_dict[attr][i]
                else:
                    row = []

                for sport in SPORTS:
                    query = SPORT_COUNT_QUERY % attr + sport
                    with conn:
                        c.execute(query, (sex,i))
                        result = c.fetchone()
                        row.extend(result)

                    all_dict[attr][i] = row

    histogram = {
            'age': {}, 'weight': {}, 'height': {},
        }

    MIN_MAX_QUERY += " and sex = ?;"
    for attr in ATTRIBUTES:
        for sex in SEXES:
            with conn:
                c.execute((MIN_MAX_QUERY % (attr,attr,attr)), sex)
                min_val,max_val = c.fetchone()

                # When sliders are at extremes, should be at 0 or 100
                min_val -= 1
                max_val += 1

                if sex == 'M':
                    histogram[attr+'_male_max'] = max_val
                    histogram[attr+'_male_min'] = min_val
                else:
                    histogram[attr+'_female_max'] = max_val
                    histogram[attr+'_female_min'] = min_val


    for attr in ATTRIBUTES:
        cur = all_dict[attr]
        hist = histogram[attr]

        min_val = min(cur.keys())
        max_val = max(cur.keys())

        hist[min_val] = ZERO_ARRAY
        for key in range(min_val+1, max_val+1):
            # Create a running total at each value
            hist[key] = map(sum, zip(hist[key-1], cur[key]))

        histogram[attr+'_counts'] = hist[max_val]

    return histogram

if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Usage: python histogram.py <db_name>")
    else:
        print "var data = " + json.dumps(get_histogram(sys.argv[1]), sort_keys=True,
                indent=4) + ";"
