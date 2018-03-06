"""web_law URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url
from django.contrib import admin
from index import home,region_distribution,time_distribution,publisher_distribution,power_distribution,year_index,show_picture_year,show_picture_law,show_picture_region,region_index,power_index,show_picture_power,publisher_index,show_picture_publisher,topic_index,show_picture_topic,label_index,show_picture_label
from index_kg import kg_home,search_law_sentence,search_law_sentence_aspect,show_kg_search,show_kg_analysis,neo4j_change_language,query_by_requirement,get_search_name,get_attributes_rel_name,get_info_relations,show_propterty
urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^home/', home),
    url(r'^region_distribution/', region_distribution),
    url(r'^time_distribution/', time_distribution),
    url(r'^publisher_distribution/', publisher_distribution),
    url(r'^power_distribution/', power_distribution),
    url(r'^year_index/', year_index),
    url(r'^show_picture_year/', show_picture_year),
    url(r'^show_picture_law/', show_picture_law),
    url(r'^region_index/', region_index),
    url(r'^show_picture_region/', show_picture_region),
    url(r'^power_index/', power_index),
    url(r'^show_picture_power/', show_picture_power),
    url(r'^publisher_index/', publisher_index),
    url(r'^show_picture_publisher/', show_picture_publisher),
    url(r'^topic_index/', topic_index),
    url(r'^show_picture_topic/', show_picture_topic),
    url(r'^label_index/', label_index),
    url(r'^show_picture_label/', show_picture_label),
    url(r'^search_law_sentence/',search_law_sentence),
    url(r'^search_law_sentence_aspect/',search_law_sentence_aspect),
    url(r'^kg_home/', kg_home),
    url(r'^show_kg_search/',show_kg_search),
    url(r'^show_kg_analysis/',show_kg_analysis),
    url(r'^neo4j_change_language/',neo4j_change_language),
    url(r'^query_by_requirement/',query_by_requirement),
    url(r'^get_search_name/',get_search_name),
    url(r'^get_attributes_rel_name/',get_attributes_rel_name),
    url(r'^get_info_relations/',get_info_relations),
    url(r'^show_propterty/',show_propterty),
]
