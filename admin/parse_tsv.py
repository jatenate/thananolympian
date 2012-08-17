#!/usr/bin/env python

import re
import sqlite3
import sys
import os

def create_db(name):
    conn = sqlite3.connect(name)
    c = conn.cursor()
    c.execute('''CREATE TABLE athletes (
                    name TEXT,      --- fullname
                    country TEXT,
                    age INTEGER,
                    height INTEGER, --- centimeters
                    weight INTEGER, --- kilograms
                    sex TEXT,    --- M/F
                    birthdate TEXT, --- YYYY-MM-DD
                    birthplace TEXT,
                    gold INTEGER,
                    silver INTEGER,
                    bronze INTEGER,
                    total INTEGER,
                    sport TEXT,
                    event TEXT
                  );''')
    conn.commit()
    c.close()

reBday = re.compile("(\d+)/(\d+)/(\d\d\d\d)")
def convert_tuple_int(tple):
    return (int(tple[2]), int(tple[0]), int(tple[1]))

def convert_birthdate(birthdate):
    return "{0[0]:02d}-{0[1]:02d}-{0[2]:02d}".format(\
            convert_tuple_int(reBday.search(birthdate).groups()))

def parse_tsv(tsv_name,db_name):
    tsv = open(tsv_name, 'r')
    conn = sqlite3.connect(db_name)
    c = conn.cursor()

    # Remove Header Line
    tsv.readline()
    for athlete in tsv:
        athlete = map((lambda x: unicode(x,"utf-8")),\
                athlete.strip().split("\t"))
        athlete[6] = convert_birthdate(athlete[6])

        c.execute("INSERT INTO athletes VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
                athlete)
        conn.commit()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print "Usage: parse_tsv.py <tsv_name> <sqlite3_db>"
        sys.exit(2)

    create_db(argv[2])
    parse_tsv(argv[1], argv[2])
