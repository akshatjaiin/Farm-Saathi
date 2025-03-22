# monitor.py
import os
import utils
import streamlit as st
import geopandas as gpd
from authentication import greeting, check_password
from senHub import SenHub
from datetime import datetime
from sentinelhub import  SHConfig
import requests
import process
from zipfile import ZipFile
import plotly.express as px

def check_authentication():
    if not check_password():
        st.stop()

# account id = 0fcc721c-165e-4f53-939f-c4506a1b6d83

config = SHConfig()
config.instance_id       = '20996045-deec-4830-85dc-ad539df944eb'
config.sh_client_id      = 'cdbf2718-3eff-4e45-a862-c694f7cf00d1'
config.sh_client_secret  = '9HLi2ZQGpMVssIXNqWFAHOC2ZoTolSJi'

def select_field(gdf):
    st.markdown("""
            <style>
            .stSelectbox > div > div {cursor: pointer;}
            </style>
            """, unsafe_allow_html=True)
    names = gdf['name'].tolist()
    names.append("Select Field")
    field_name = st.selectbox("Select Field", options=names, key="field_name_monitor", help="Select the field to edit", index=len(names)-1)
    return field_name


def calculate_bbox(df, field):
    bbox = df.loc[df['name'] == field].bounds
    r = bbox.iloc[0]
    return [r.minx, r.miny, r.maxx, r.maxy]

def get_available_dates_for_field(df, field, year, start_date='', end_date=''):
    bbox = calculate_bbox(df, field)
    token = SenHub(config).token
    headers = utils.get_bearer_token_headers(token)
    if start_date == '' or end_date == '':
        start_date = f'{year}-01-01'
        end_date = f'{year}-12-31'
    data = f'{{ "collections": [ "sentinel-2-l2a" ], "datetime": "{start_date}T00:00:00Z/{end_date}T23:59:59Z", "bbox": {bbox}, "limit": 100, "distinct": "date" }}'
    response = requests.post('https://services.sentinel-hub.com/api/v1/catalog/search', headers=headers, data=data)
    try:
        features = response.json()['features']
    except:
        print(response.json())
        features = []
    return features

@st.cache_data
def get_and_cache_available_dates(_df, field, year, start_date, end_date):
    dates = get_available_dates_for_field(_df, field, year, start_date, end_date)
    print(f'Caching Dates for {field}')
    return dates




def get_cuarted_df_for_field(df, field, date, metric, clientName):
    curated_date_path =  utils.get_curated_location_img_path(clientName, metric, date, field)
    if curated_date_path is not None:
        curated_df = gpd.read_file(curated_date_path)
    else:
        process.Download_image_in_given_date(clientName, metric, df, field, date)
        process.mask_downladed_image(clientName, metric, df, field, date)
        process.convert_maske_image_to_geodataframe(clientName, metric, df, field, date, df.crs)
        curated_date_path =  utils.get_curated_location_img_path(clientName, metric, date, field)
        curated_df = gpd.read_file(curated_date_path)
    return curated_df


def track(metric, field_name, src_df, client_name):
    st.title(":green[Select Date and Start Monitoring]")
    dates = []
    date = -1
    if 'dates' not in st.session_state:
        st.session_state['dates'] = dates
    else:
        dates = st.session_state['dates']
    if 'date' not in st.session_state:
        st.session_state['date'] = date
    else:
        date = st.session_state['date']

    if True:
        start_date = '2024-01-01'
        today = datetime.today()
        end_date = today.strftime('%Y-%m-%d')
        year = '2024'

        dates = get_and_cache_available_dates(src_df, field_name, year, start_date, end_date)
        # Add None to the end of the list to be used as a default value
        #sort the dates from earliest to today
        dates = sorted(dates)

        #Add the dates to the session state
        st.session_state['dates'] = dates

    # Display the dropdown menu
    if len(dates) > 0:
        st.markdown("""
            <style>
            .stSelectbox > div > div {cursor: pointer;}
            </style>
            """, unsafe_allow_html=True)
        date = st.selectbox('Select Observation Date: ', dates, index=len(dates)-1, key=f'Select Date Dropdown Menu - {metric}')
        if date != -1:
            st.success(f'You selected: {date}')
            #Add the date to the session state
            st.session_state['date'] = date
        else:
            st.write('Please Select A Date')
    else:
        st.info('No dates available for the selected field and dates range, select a different range or click the button to fetch the dates again')


    st.markdown('---')
    st.header('Show Field Data')

    # If a field and a date are selected, display the field data
    if date != -1:   

        # Get the field data at the selected date
        with st.spinner('Loading Field Data...'):
            # Get the metric data and cloud cover data for the selected field and date
            metric_data = get_cuarted_df_for_field(src_df, field_name, date, metric, client_name)
            cloud_cover_data = get_cuarted_df_for_field(src_df, field_name, date, 'CLP', client_name)
            
            #Merge the metric and cloud cover data on the geometry column
            field_data = metric_data.merge(cloud_cover_data, on='geometry')

        # Display the field data
        avg_clp = field_data[f'CLP_{date}'].mean() *100
        avg_metric = field_data[f'{metric}_{date}'].mean() 
        st.write(f'Field Data for (Field ID: {field_name}) on {date}')
        col1,col3,col5,col2,col4 = st.columns(5)
        col1.metric(f":orange[Average {metric}]", value=f"{avg_metric :.2f}")
        col2.metric(":green[Cloud Cover]",  value=f"{avg_clp :.2f}%")

        #Get Avarage Cloud Cover

        # If the avarage cloud cover is greater than 80%, display a warning message
        if avg_clp > 80:
            st.warning(f'⚠️ The Avarage Cloud Cover is {avg_clp}%')
            st.info('Please Select A Different Date')

  

        df = field_data.copy()
        df['latitude'] = df['geometry'].y
        df['longitude'] = df['geometry'].x

        # Create a scatter plot
        fig = px.scatter_mapbox(
            df, 
            lat='latitude', 
            lon='longitude', 
            color=f'{metric}_{date}',
            color_continuous_scale='RdYlGn',
            range_color=(0, 1),
            width= 800,
            height=600,
            size_max=15,
            zoom=13,
        )

        # Add the base map
        token = open("token.mapbox_token").read()
        fig.update_layout(mapbox_style="satellite", mapbox_accesstoken=token)
        st.plotly_chart(fig)

        #Dwonload Links

        # If the field data is not empty, display the download links
        if len(field_data) > 0:
            # Create two columns for the download links
            download_as_shp_col, download_as_tiff_col = st.columns(2)

            # Create a shapefile of the field data and add a download link
            with download_as_shp_col:

                #Set the shapefile name and path based on the field id, metric and date
                extension = 'shp'
                shapefilename = f"{field_name}_{metric}_{date}.{extension}"
                path = f'./shapefiles/{field_name}/{metric}/{extension}'

                # Create the target directory if it doesn't exist
                os.makedirs(path, exist_ok=True)
                
                # Save the field data as a shapefile
                field_data.to_file(f'{path}/{shapefilename}')

                # Create a zip file of the shapefile
                files = []
                for i in os.listdir(path):
                    if os.path.isfile(os.path.join(path,i)):
                        if i[0:len(shapefilename)] == shapefilename:
                            files.append(os.path.join(path,i))
                zipFileName = f'{path}/{field_name}_{metric}_{date}.zip'
                zipObj = ZipFile(zipFileName, 'w')
                for file in files:
                    zipObj.write(file)
                zipObj.close()

                # Add a download link for the zip file
                with open(zipFileName, 'rb') as f:
                    st.download_button('Download as ShapeFile', f,file_name=zipFileName)

            # Get the tiff file path and create a download link
            with download_as_tiff_col:
                #get the tiff file path
                tiff_path = utils.get_masked_location_img_path(client_name, metric, date, field_name)
                # Add a download link for the tiff file
                donwnload_filename = f'{metric}_{field_name}_{date}.tiff'
                with open(tiff_path, 'rb') as f:
                    st.download_button('Download as Tiff File', f,file_name=donwnload_filename)

    else:
        st.info('Please Select A Field and A Date')
           

def monitor_fields():
    row1,row2 = st.columns([1,2])
    with row1:
        st.title(":orange[Field Monitoring]")

        current_user = greeting("Let's take a look how these fields are doing")
        if os.path.exists(f"fields_{current_user}.parquet"):
            gdf = gpd.read_parquet(f"fields_{current_user}.parquet")
            field_name = select_field(gdf)
            if field_name == "Select Field":
                st.info("No Field Selected Yet!")  
            else:
                metric = st.radio("Select Metric to Monitor", ["NDVI", "LAI", "CAB"], key="metric", index=0, help="Select the metric to monitor")
                st.success(f"Monitoring {metric} for {field_name}")
                with st.expander("Metrics Explanation", expanded=False):
                    st.write("NDVI: Normalized Difference Vegetation Index, Mainly used to monitor the health of vegetation")
                    st.write("LAI: Leaf Area Index, Mainly used to monitor the productivity of vegetation")
                    st.write("CAB: Chlorophyll Absorption in the Blue band, Mainly used to monitor the chlorophyll content in vegetation")
                    # st.write("NDMI: Normalized Difference Moisture Index, Mainly used to monitor the moisture content in vegetation")
                st.info("More metrics and analysis features will be added soon")
        else:
            st.info("No Fields Added Yet!")
            return

        

        with row2:
            if field_name != "Select Field":
                track(metric, field_name, gdf, current_user)

        


if __name__ == '__main__':
    check_authentication()
    monitor_fields()