import pandas as pd
import numpy as np
import gramex.cache
calendar_data = gramex.cache.open('calendar_data.csv', encoding='utf-8')
calendar_data['Year'] = calendar_data['Event Date'].apply(lambda x: x.split('-')[2])

key_dict = {
    'manufacture-agegroup':'age_group',
    'manufacture-outcome':'outc_cod',
    'manufacturer-wise':'mfr_sndr',
    'reporter-occupation-wise':'occp_cod',
    'age-group-wise':'age_group'
}

def filters(handler):
    selct_years =  calendar_data['Year'].unique().tolist()
    selct_years.sort(reverse=True)
    get_year = handler.get_argument('year', '2018')
    result = {
        'selected_year': get_year,
        'years': selct_years
    }
    return result


def mfr_data(data, handler):
    view = key_dict[handler.args.get('view', ['manufacture-agegroup'])[0]]
    data = data[[view,'mfr_sndr', 'Year']].fillna('NA')
    data = data.groupby([view, 'mfr_sndr']).agg({'Year': 'count'}).reset_index()
    theads = data[view].unique().tolist()
    data = data.pivot_table(values='Year', columns=view, index='mfr_sndr').reset_index()
    data['Total'] = data[theads].sum(axis=1)
    data = data.sort_values(['Total'], ascending=[0])
    return data


def serious_data(data, handler):
    view = key_dict[handler.args.get('view', ['manufacturer-wise'])[0]]
    data = data[[view,'outc_cod', 'Year']].fillna('NA')
    data = data.groupby([view,'outc_cod']).agg({'Year': 'count'}).reset_index()
    data = data.pivot_table(values='Year', columns='outc_cod', index=view)
    data = data.fillna(0)
    data['total_report'] = data[['CA', 'DE', 'DS', 'HO', 'LT', 'OT', 'RI']].sum(axis=1)
    data['serious_report'] = data[['DE', 'DS', 'LT', 'OT']].sum(axis=1)
    data['percentage'] = (data['serious_report'] / data['total_report']) * 100
    data.index.rename('dim', inplace=True)
    data = data[['total_report', 'serious_report', 'percentage']].reset_index()
    return data


def test(handler):
    data = pd.read_csv("dji.csv")
    data = data[['date', 'close']]
    return {"data": data}