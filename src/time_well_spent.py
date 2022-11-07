"""
The following functions are made to calculate the time spent on various things over my life.

"""


def create_years_dictionary(birth_year, this_year):
    years = {}
    for x in range(birth_year, this_year):
        dict[x] = []
    return years

def hours_per_day_to_week(hours_per_day, five_day=True):
    
    if five_day:
        return hours_per_day*5
    else:
        return hours_per_day*7

def hours_per_week_to_year(hours_per_week):
    return hours_per_week*52

def hours_per_weeks_to_school_year(hours_per_week, uni=False):
    if uni:
        return hours_per_week*25    
    else:
        return hours_per_week*40

